// ✅ React setup for calling a non-streaming Lambda via API Gateway
// Replace <your-api-url> with your actual endpoint

import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setResult("");
    setLoading(true);

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
    <div>
      <h1>Investor Relations Assistant</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Loading..." : "Ask"}
      </button>
      <pre style={{
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  background: "#f4f4f4",
  padding: "1rem",
  borderRadius: "6px",
  maxHeight: "400px",
  overflowY: "auto"
}}>
  {result}
</pre>

    </div>
  );
}

export default App;

