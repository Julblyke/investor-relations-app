// ✅ React setup for calling a non-streaming Lambda via API Gateway
// Replace <your-api-url> with your actual endpoint

import { useState, useRef, useEffect } from "react";
import { CiLocationArrow1 } from "react-icons/ci";
import JabilLogo from "./assets/images/Jabil_White_+_Sky_Blue_RGB.png";

import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(false);
  const thinkingTranslations = [                        //Array with thinking translations
    "思考中 ...", // Chinese
    "Thinking ...", // English
    "考え中 ...", // Japanese
    "Pensando ...", // Spanish
  ];
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const thinkingInterval = useRef(null);
  const [typewriterText, setTypewriterText] = useState("");
  const typewriterTimeout = useRef(null);

  // Hook to handle the thinking animation
  useEffect(() => {   
    if (loading) {
      setThinkingIndex(0);
      thinkingInterval.current = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % thinkingTranslations.length);
      }, 1500);
    } else {
      clearInterval(thinkingInterval.current);
    }
    return () => clearInterval(thinkingInterval.current);
  }, [loading]);

  // Hook to handle the typewriter effect
  useEffect(() => {
    if (!loading && result) {
      setTypewriterText("");
      let i = -1;
      function type() {
        setTypewriterText((prev) => prev + result[i]);
        i++;
        if (i < result.length) {
          typewriterTimeout.current = setTimeout(type, 15);
        }
      }
      type();
      return () => clearTimeout(typewriterTimeout.current);
    } else if (loading) {
      setTypewriterText("");
    }
  }, [result, loading]);

  // Function to handle the ask button click
  const handleAsk = async () => {
    setInput("");
    setResult("");
    setLoading(true);
    // Call the Lambda function
    try {
      const response = await fetch("https://33bd316geg.execute-api.us-east-1.amazonaws.com/anotherstage/ask-bedrock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: 
JSON.stringify({ inputText: input }),
      });

      const data = await response.json();
      if (data.completion) {
        setResult(data.completion);
      } else {
        setResult("No response from agent.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setResult("Error fetching response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="header">
        <h1>Investor Relations Assistant</h1>
        <h2>by</h2>
        <img src={JabilLogo} alt="Jabil Logo" className="header-logo" />
      </div>
      <div className="result-container">
        <div className="result-content-wrapper">
          <pre className={`result-content${loading ? ' loading-content' : ''}`}>
            {loading ? (
              <span className="thinking-wrapper">
                <span className="spinner" />
                <span className="thinking-text">{thinkingTranslations[thinkingIndex]}</span>
              </span>
            ) : (
              typewriterText
            )}
          </pre>
        </div>
      </div>
      <div className={`input-wrapper${inputError ? " input-error" : ""}`}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { // Handle Enter key press
            if (e.key === "Enter" && !loading) {
              if (input.trim() === "") {
                setInputError(true);
                setTimeout(() => setInputError(false), 500);
              } else {
                handleAsk();
              }
            }
          }}
          placeholder="Ask me something..."
          className="ask-input"
        />
        <button onClick={handleAsk} disabled={loading || input.trim() === ""} className="ask-button">
          <CiLocationArrow1 />
        </button>
      </div>
    </div>
  );
}

export default App;
