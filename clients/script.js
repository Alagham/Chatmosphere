document.addEventListener("DOMContentLoaded", () => {
  // ===== USER PROFILE SETUP =====
  const username1 = localStorage.getItem("chatUsername") || "User";
  const username2 = localStorage.getItem("chatUsername") || "User";
  const userImage = localStorage.getItem("chatUserImage");

  document.getElementById("userName1").textContent = username1;
  document.getElementById("userName2").textContent = username2;

  const avatar = document.querySelector(".avatar-placeholder");
  if (userImage) {
    avatar.innerHTML = `<img src="${userImage}" alt="Avatar" style="width:30px;height:30px;border-radius:50%;">`;
  }
  document.querySelector(".pro-badge").style.display = "none";

  // ===== MODAL =====
  const learnMoreBtn = document.querySelector(".learn-more");
  const modal = document.getElementById("learnMoreModal");
  const closeModal = document.querySelector(".close-modal");

  learnMoreBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // ===== CHAT FUNCTIONALITY =====
  const chatForm = document.getElementById("chatForm");
  const chatContainer = document.getElementById("chatContainer");
  const userInput = document.getElementById("userInput");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Show user's message
    addMessage(username1, message, "user");
    userInput.value = "";

    // Show loading message from bot
    const loadingId = addMessage("Chátmosphere", "...", "bot");

    // Fetch bot reply from backend
    const botReply = await fetchBotResponse(message);

    // Replace loading with real message
    updateMessage(loadingId, botReply);
  });

  // ===== FUNCTIONS =====
  function addMessage(sender, text, type) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type);
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgDiv; // return element so we can update it later
  }

  function updateMessage(msgElement, newText) {
    if (msgElement) {
      msgElement.innerHTML = `<strong>Chátmosphere:</strong> ${newText}`;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async function fetchBotResponse(prompt) {
    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: prompt })
      });

      const data = await res.json();
      return data.reply || "Sorry, I couldn't get a response.";
    } catch (error) {
      console.error(error);
      return "Error fetching response.";
    }
  }
});
