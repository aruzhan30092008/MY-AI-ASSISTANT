const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.getElementById("newChat");

let messages = [];

function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = message ${type};
  message.textContent = text;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;

  return message;
}

// Жаңа чат ашу
newChat.addEventListener("click", () => {
  messages = [];

  chat.innerHTML = `
    <div class="welcome">
      <div class="logo">✦</div>
      <h1>Сәлем! 👋</h1>
      <p>Мен сенің AI көмекшіңмін.
      Маған кез келген сұрағыңды қоя аласың.</p>
    </div>
  `;
});

// Хабарлама жіберу
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = input.value.trim();

  if (!question || sendBtn.disabled) return;

  const welcome = chat.querySelector(".welcome");

  if (welcome) welcome.remove();

  messages.push({
    role: "user",
    content: question
  });

  addMessage(question, "user");

  input.value = "";
  sendBtn.disabled = true;

  const loading = addMessage(
    "Жауап дайындалып жатыр...",
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
      throw new Error(data.error || "Сервер қатесі");
    }

    loading.textContent = data.answer;

    messages.push({
      role: "assistant",
      content: data.answer
    });

  } catch (error) {
    loading.textContent = "Қате: " + error.message;
    messages.pop();

  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

// Enter арқылы хабарлама жіберу
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
