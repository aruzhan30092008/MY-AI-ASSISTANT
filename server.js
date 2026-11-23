import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Хабарлама бос"
      });
    }

    const history = messages.slice(-12);

    const response = await ai.responses.create({
      model: "gpt-5.5",
      instructions: "You are a helpful assistant. Answer in the user's language. Support Kazakh, Russian and English.",
      input: history.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    res.json({
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI жауап бере алмады. Қайталап көр."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI Assistant is running!");
});
