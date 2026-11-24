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

// Welcome screen
function showWelcome() {
  chat.innerHTML = `
    <div class="welcome">
      <div class="logo">✦</div>
      <h1>Сәлем! 👋</h1>
      <p>
        Мен StudySpot AI көмекшісімін.
        Аудитория, кітапхана және оқу орындарын
        брондау туралы сұрақтарыңды қоя аласың.
      </p>
    </div>
  `;
}

// New chat
newChat.addEventListener("click", () => {
  messages = [];
  showWelcome();
  input.focus();
});

// Send message
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
    "StudySpot AI жауап дайындап жатыр...",
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
      throw new Error(data.error || "Server error");
    }

    loading.textContent = data.answer;

    messages.push({
      role: "assistant",
      content: data.answer
    });

    messages = messages.slice(-12);

  } catch (error) {
    loading.textContent =
      "Кешіріңіз, қате пайда болды. Қайтадан көріңіз.";

    messages.pop();

    console.error("StudySpot AI:", error);

  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

// Enter to send
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
