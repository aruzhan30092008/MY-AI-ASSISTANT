 import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API кілті бар болса ғана OpenAI қосылады
const ai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(express.json({ limit: "20kb" }));

app.use(express.static(path.join(__dirname, "public")));

// Сервер жұмысын тексеру
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "StudySpot AI"
  });
});

// StudySpot AI чат жүйесі
app.post("/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "OpenAI API key is not configured."
      });
    }

    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const history = messages.slice(-12);

    const valid = history.every(message =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim().length > 0 &&
      message.content.length <= 4000
    );

    if (!valid || history[history.length - 1].role !== "user") {
      return res.status(400).json({
        error: "Invalid message format."
      });
    }

    const response = await ai.responses.create({
      model: "gpt-5.5",

      instructions: `
You are StudySpot AI, a friendly assistant
for a student platform called StudySpot.

StudySpot helps students find and book:
- Study rooms
- Classrooms
- Library spaces
- Places for individual and group study

YOUR TASKS:
1. Explain how to use StudySpot.
2. Help students understand room booking.
3. Explain how to find a suitable study space.
4. Answer questions about libraries and classrooms.
5. Help with general study-related questions.
6. Explain booking steps in simple language.

LANGUAGE:
- Detect the language of each user message.
- Reply in the same language.
- Support Kazakh, Russian and English.
- Be natural and friendly.

IMPORTANT:
- Give clear and accurate answers.
- Never invent available rooms or booking times.
- Never invent prices, addresses or opening hours.
- You do not have access to the live booking database.
- Never say a booking is confirmed.
- Direct users to the booking page to make reservations.
- If you do not know something, be honest.
- Do not pretend to perform actions you cannot perform.
- Keep answers focused on StudySpot and student needs.

Your goal is to make StudySpot easy and convenient
for every student.
      `,

      input: history.map(message => ({
        role: message.role,
        content: message.content
      }))
    });

    res.json({
      answer: response.output_text
    });

  } catch (error) {
    console.error("StudySpot AI error:", error);

    res.status(500).json({
      error: "AI is temporarily unavailable. Please try again."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
console.log(StudySpot AI running on port ${PORT}); 
});
