import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "StudySpot AI"
  });
});

// Тегін дайын жауап жүйесі
function getAnswer(text) {
  const q = text.toLowerCase().trim();

  // Қазақша, орысша, ағылшынша жауап
  const isRussian = /[а-яё]/i.test(q) &&
    !/[әіңғұүқөһ]/i.test(q);
  const isEnglish = /^[a-z\s?!.,]+$/i.test(q);

  const reply = (kk, ru, en) =>
    isRussian ? ru : isEnglish ? en : kk;

  if (/сәлем|салем|привет|hello|hi\b/.test(q)) {
    return reply(
      "Сәлем! Мен StudySpot көмекшісімін. Кітапхана, оқу орындары және брондау туралы сұрақтарыңа көмектесемін.",
      "Здравствуйте! Я помощник StudySpot. Я помогу с вопросами о библиотеке, учебных местах и бронировании.",
      "Hello! I'm StudySpot assistant. I can help with library, study spaces and booking questions."
    );
  }

  if (/studyspot|сайт|сервис|платформа/.test(q)) {
    return reply(
      "StudySpot — студенттерге оқу орындарын табуға және оқу кеңістіктерін пайдалануға көмектесетін платформа. Сайт арқылы қолжетімді орындар туралы ақпарат алып, брондау тәртібімен танысуға болады.",
      "StudySpot — платформа, которая помогает студентам находить места для учёбы и знакомиться с системой бронирования.",
      "StudySpot is a platform that helps students find study spaces and learn how to book them."
    );
  }

  if (/брон|book|резерв|заказ.*мест|орын.*сақта/.test(q)) {
    return reply(
      "Орын брондау үшін сайттағы брондау бөліміне кіріп, қолжетімді орындарды қарап, қажетті орынды таңдаңыз. Брондаудың аяқталғанын сайттағы растаудан тексеріңіз. Мен нақты бос орындарды көре алмаймын.",
      "Чтобы забронировать место, откройте раздел бронирования, выберите доступное место и следуйте инструкциям. Я не вижу актуальную базу свободных мест.",
      "To book a space, open the booking section, select an available space and follow the instructions. I cannot see live availability."
    );
  }

  if (/кітапхана|библиотек|library/.test(q)) {
    return reply(
      "Кітапхана — студенттерге сабақ оқуға, әдебиеттермен жұмыс істеуге және тыныш оқу ортасын пайдалануға арналған орын. Нақты жұмыс уақытын университеттің ресми ақпаратынан тексеріңіз.",
      "Библиотека — место для учёбы, работы с учебными материалами и самостоятельной подготовки. Уточняйте часы работы на официальных ресурсах университета.",
      "A library is a space for studying, accessing learning materials and independent work. Check your university's official resources for opening hours."
    );
  }

  if (/оқу орны|оқу зал|study room|classroom|аудитор|study space/.test(q)) {
    return reply(
      "StudySpot оқу орындарын табуға көмектеседі. Сайттың тиісті бөлімінен оқу кеңістіктері туралы ақпаратты қараңыз. Нақты орындардың қолжетімділігі туралы ақпаратты брондау бөлімінен тексеріңіз.",
      "StudySpot помогает находить учебные пространства. Посмотрите информацию в соответствующем разделе сайта. Актуальную доступность уточняйте в разделе бронирования.",
      "StudySpot helps you find study spaces. Check the relevant section of the website and confirm availability in the booking section."
    );
  }

  if (/университет|university|вуз/.test(q)) {
    return reply(
      "Университет туралы нақты ақпарат алу үшін оның ресми сайтына немесе студенттерге арналған ақпараттық бөлімдерге жүгініңіз. StudySpot оқу орындарын пайдалану мен брондау туралы көмектеседі.",
      "Для получения точной информации об университете посетите его официальный сайт. StudySpot помогает с информацией об учебных пространствах и бронировании.",
      "For accurate university information, visit its official website. StudySpot helps with study spaces and booking information."
    );
  }

  if (/көмек|help|помощ|не істей|что ты можешь/.test(q)) {
    return reply(
      "Мен StudySpot платформасы, кітапхана, оқу орындары және брондау тәртібі туралы сұрақтарға жауап бере аламын. Сұрағыңызды нақтырақ жазыңыз.",
      "Я могу помочь с вопросами о StudySpot, библиотеке, учебных пространствах и бронировании. Задайте более конкретный вопрос.",
      "I can help with StudySpot, libraries, study spaces and booking procedures. Please ask a more specific question."
    );
  }

  return reply(
    "Бұл сұрақ бойынша менде әзірге дайын ақпарат жоқ. Кітапхана, StudySpot платформасы, оқу орындары немесе брондау туралы сұрап көріңіз.",
    "У меня пока нет готового ответа на этот вопрос. Попробуйте спросить о библиотеке, StudySpot, учебных местах или бронировании.",
    "I don't have a prepared answer for that yet. Try asking about the library, StudySpot, study spaces or booking."
  );
}

app.post("/chat", (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const lastMessage = messages[messages.length - 1];

    if (
      !lastMessage ||
      lastMessage.role !== "user" ||
      typeof lastMessage.content !== "string" ||
      !lastMessage.content.trim()
    ) {
      return res.status(400).json({
        error: "Invalid message format."
      });
    }

    const answer = getAnswer(lastMessage.content);

    res.json({ answer });

  } catch (error) {
    console.error("StudySpot error:", error);

    res.status(500).json({
      error: "Something went wrong."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(StudySpot AI running on port ${PORT});
});
