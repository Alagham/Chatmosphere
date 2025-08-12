import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the "server" folder
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("✅ API Key loaded:", !!process.env.OPENROUTER_API_KEY);

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
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

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
