const ChatApp = {
  currentSession: [],
  chatHistory: [],
  recentChats: [],

  saveCurrentChat() {
    if (!this.currentSession.length) return;
    const session = {
      id: Date.now(),
      messages: [...this.currentSession],
      timestamp: Date.now()
    };
    this.chatHistory.push(session);
    this.recentChats.push(session);
    this.cleanupRecentChats();
    this.persistData();
    this.currentSession = [];
    renderHistory();
    renderRecentChats();
  },

  cleanupRecentChats() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    this.recentChats = this.recentChats.filter(c => c.timestamp > cutoff);
  },

  persistData() {
    localStorage.setItem("chatHistory", JSON.stringify(this.chatHistory));
    localStorage.setItem("recentChats", JSON.stringify(this.recentChats));
  },

  loadData() {
    this.chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    this.recentChats = JSON.parse(localStorage.getItem("recentChats")) || [];
  }
};


function initUserProfile() {
  const username = localStorage.getItem("chatUsername") || "User";
  document.getElementById("userName1").textContent = username;
  document.getElementById("userName2").textContent = username;

  const userImage = localStorage.getItem("chatUserImage");
  if (userImage) {
    const avatar = document.querySelector(".avatar-placeholder");
    avatar.innerHTML = `<img src="${userImage}" alt="User Avatar" class="user-avatar" />`;
  }
}

function addMessage(sender, text) {
  ChatApp.currentSession.push({
    sender,
    text,
    timestamp: Date.now()
  });
  renderChat(ChatApp.currentSession);
}

function startNewChat() {
  ChatApp.saveCurrentChat();
  ChatApp.currentSession = [];
  renderChat([]);
}

function searchChats(keyword) {
  const results = ChatApp.chatHistory.filter(chat =>
    chat.messages.some(msg => msg.text.toLowerCase().includes(keyword.toLowerCase()))
  );
  renderSearchResults(results);
}


function renderChat(messages) {
  const chatBox = document.getElementById("chatContainer");
  if (!messages.length) {
    chatBox.innerHTML = `<h2>Hello, <span id="userName2">${localStorage.getItem("chatUsername") || "User"}</span></h2>
      <p>Welcome to <strong>Chátmosphere</strong>, how can we help you today?</p>`;
    return;
  }
  chatBox.innerHTML = messages.map(msg =>
    `<div class="chat-message ${msg.sender}">
       <strong>${msg.sender}:</strong> ${msg.text}
     </div>`
  ).join("");
}

function renderHistory() {
  const historySection = document.querySelector(".history-section");
  historySection.innerHTML = `<h3>🕘 History</h3>` + 
    ChatApp.chatHistory.map(chat => `<div class="history-item">Chat ${chat.id}</div>`).join("");
}

function renderRecentChats() {
  const recentList = document.getElementById("chatHistory");
  recentList.innerHTML = ChatApp.recentChats.map(chat =>
    `<li>Chat ${chat.id}</li>`
  ).join("");
}

function renderSearchResults(results) {
  const historySection = document.querySelector(".history-section");
  historySection.innerHTML = `<h3>🔍 Search Results</h3>` + 
    results.map(chat => `<div class="history-item">Chat ${chat.id}</div>`).join("");
}


document.addEventListener("DOMContentLoaded", () => {
  ChatApp.loadData();
  initUserProfile();
  renderHistory();
  renderRecentChats();

  document.getElementById("newChatBtn").addEventListener("click", startNewChat);

  document.querySelector(".search-chat").addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    if (keyword) {
      searchChats(keyword);
    } else {
      renderHistory();
    }
  });

  document.getElementById("chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const userInput = document.getElementById("userInput");
    const text = userInput.value.trim();
    if (text) {
      addMessage("User", text);
      userInput.value = "";
    }
  });
});
