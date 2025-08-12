import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Send request to OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // You can change this to other models OpenRouter supports
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
  console.error("OpenRouter API error:", data);
  return res.status(500).json({
    error: "Failed to fetch from OpenRouter",
    details: data
  });
}

    res.json({
      reply: data.choices?.[0]?.message?.content || "No reply from AI."
    });

  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
