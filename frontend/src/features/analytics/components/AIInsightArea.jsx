import React, { useState } from 'react';

const AIInsightArea = () => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = (simulateError = false) => {
    setLoading(true);
    setInsight("");
    setError("");

    // Simulate AI Service Call
    setTimeout(() => {
      if (simulateError) {
        setError("Error: AI Service is currently unavailable. Please check your connection and try again.");
        setLoading(false);
      } else {
        setInsight("Based on your sales data, trends indicate high demand for custom prints.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div id="ai-insight-section" style={{ marginTop: '20px', border: '1px solid purple', padding: '15px' }}>
      <h3>AI Business Insights</h3>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => handleAnalyze(false)} disabled={loading}>
          {loading ? "Processing..." : "Analyze Business Trends"}
        </button>
        
        {/* Helper button for testing the failure scenario */}
        <button 
          onClick={() => handleAnalyze(true)} 
          disabled={loading}
          style={{ fontSize: '10px', opacity: 0.5 }}
        >
          Simulate AI Failure
        </button>
      </div>

      <div 
        data-testid="insight-box"
        style={{ 
          height: '100px', 
          border: '1px inset #ccc', 
          marginTop: '10px',
          padding: '10px', 
          backgroundColor: '#f0f0f0',
          overflowY: 'auto',
          wordWrap: 'break-word'
        }}
      >
        {loading && <p><strong>Generating insights...</strong></p>}
        
        {/* Logic: Handle unsuccessful AI calls */}
        {error && <p style={{ color: 'red' }}><strong>{error}</strong></p>}
        
        {!loading && !insight && !error && <p><i>Click analyze to generate AI suggestions.</i></p>}
        
        {!loading && insight && <p>{insight}</p>}
      </div>
    </div>
  );
};

export default AIInsightArea;