// src/utils/api.js
export const callOpenRouterAPI = async (prompt) => {
  try {
    const res = await fetch("/api/aiChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ensure cookie token is sent to server for auth + retrieval
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    return data.reply || "No reply from AI.";
  } catch (error) {
    console.error("AI API error:", error);
    return "Sorry, there was an error.";
  }
};
