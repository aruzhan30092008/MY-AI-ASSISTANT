const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.getElementById("newChat");

// Сұхбат тарихы
let messages = [];
let isSending = false;

// Welcome screen
function showWelcome() {
  chat.innerHTML = `
    <div class="welcome">
      <div class="logo">✦</div>
      <h1>Welcome to StudySpot! 👋</h1>
      <p>
        Мен StudySpot AI көмекшісімін.
        Аудитория, кітапхана және оқу орындарын
        брондау туралы кез келген сұрағыңды қоя аласың.
      </p>
    </div>
  `;
}

// Хабарламаны экранға шығару
function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = message ${type};
  message.textContent = text;

  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;

  return message;
}

// Жаңа чат бастау
if (newChat) {
  newChat.addEventListener("click", () => {
    if (isSending) return;

    messages = [];
    showWelcome();
    input.focus();
  });
}

// AI серверіне сұрақ жіберу
async function sendToAI(question) {
  messages.push({
    role: "user",
    content: question
  });

  isSending = true;
  sendBtn.disabled = true;
  input.disabled = true;

  const loading = addMessage(
    "✦ StudySpot AI жауап дайындап жатыр...",
    "assistant"
  );

  try {
    const response = await fetch("/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Серверде қате пайда болды."
      );
    }

    if (!data.answer) {
      throw new Error("AI бос жауап қайтарды.");
    }

    // AI жауабын көрсету
    loading.textContent = data.answer;

    // Сұхбат тарихына қосу
    messages.push({
      role: "assistant",
      content: data.answer
    });

    // Соңғы 12 хабарламаны сақтау
    messages = messages.slice(-12);

  } catch (error) {
    console.error("StudySpot AI Error:", error);

    loading.textContent =
      "Кешіріңіз, AI уақытша жауап бере алмай тұр. " +
      "Интернетті тексеріп, қайта көріңіз.";

    // Сәтсіз сұрақты тарихтан алып тастау
    messages.pop();

  } finally {
    isSending = false;
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();

    chat.scrollTop = chat.scrollHeight;
  }
}

// Қолданушы хабарламасын жіберу
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question || isSending) return;

    // Welcome бөлімін жасыру
    const welcome = chat.querySelector(".welcome");

    if (welcome) {
      welcome.remove();
    }

    // Қолданушы сұрағын көрсету
    addMessage(question, "user");

    // Input тазалау
    input.value = "";

    // AI-ға жіберу
    await sendToAI(question);
  });
}

// Enter арқылы хабарлама жіберу
if (input) {
  input.addEventListener("keydown", (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !isSending
    ) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}

// Бастапқы экран
showWelcome();

console.log("StudySpot AI chat initialized successfully!");
