const ChatApp = {
  currentSession: [],
  chatHistory: [],
  recentChats: [],
  userData: {
    username: "User",
    userImage: null
  },

  saveCurrentChat() {
    if (this.currentSession.length > 0) {
      const session = {
        id: Date.now(),
        messages: [...this.currentSession],
        timestamp: Date.now(),
        preview: this.currentSession[0]?.text.substring(0, 50) + "..." || "Empty chat"
      };
      this.chatHistory.push(session);
      this.recentChats.push(session);
      this.cleanupRecentChats();
      this.persistData();
      renderHistory();
      renderRecentChats();
    }
    this.currentSession = [];
  },

  cleanupRecentChats() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    this.recentChats = this.recentChats.filter(c => c.timestamp > cutoff);
  },

  persistData() {
    console.log("Data persisted in memory:", {
      historyCount: this.chatHistory.length,
      recentCount: this.recentChats.length
    });
  },

  loadData() {
    this.chatHistory = [];
    this.recentChats = [];
  },

  deleteChat(chatId) {
    this.chatHistory = this.chatHistory.filter(chat => chat.id !== chatId);
    this.recentChats = this.recentChats.filter(chat => chat.id !== chatId);
    this.persistData();
    renderHistory();
    renderRecentChats();
  },

  loadChat(chatId) {
    const chat = this.chatHistory.find(c => c.id === chatId);
    if (chat) {
      this.currentSession = [...chat.messages];
      renderChat(this.currentSession);
    }
  }
};

function initUserProfile() {
  const storedUsername = localStorage.getItem("chatUsername") || "User";
  ChatApp.userData.username = storedUsername;
  
  const userName1 = document.getElementById("userName1");
  const userName2 = document.getElementById("userName2");
  
  if (userName1) userName1.textContent = storedUsername;
  if (userName2) userName2.textContent = storedUsername;

  const userImage = localStorage.getItem("chatUserImage");
  if (userImage) {
    ChatApp.userData.userImage = userImage;
    const avatar = document.querySelector(".avatar-placeholder");
    if (avatar) {
      avatar.innerHTML = `<img src="${userImage}" alt="User Avatar" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" />`;
    }
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

async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const text = userInput.value.trim();
  
  if (!text) return;
  
  addMessage("User", text);
  userInput.value = "";
  
  const loadingMessage = {
    sender: "Chátmosphere",
    text: "...",
    timestamp: Date.now(),
    isLoading: true
  };
  ChatApp.currentSession.push(loadingMessage);
  renderChat(ChatApp.currentSession);
  
  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text })
    });

    ChatApp.currentSession = ChatApp.currentSession.filter(msg => !msg.isLoading);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    addMessage("Chátmosphere", data.reply);
    
  } catch (error) {
    console.error('API Error:', error);
    ChatApp.currentSession = ChatApp.currentSession.filter(msg => !msg.isLoading);
    addMessage("Chátmosphere", "Sorry, I'm having trouble connecting right now. Please try again.");
  }
}

function startNewChat() {
  ChatApp.saveCurrentChat();
  ChatApp.currentSession = [];
  renderChat([]);
  
  const searchInput = document.querySelector(".search-chat");
  if (searchInput) {
    searchInput.value = "";
    renderHistory(); 
  }
}

function searchChats(keyword) {
  if (!keyword.trim()) {
    renderHistory();
    return;
  }
  
  const results = ChatApp.chatHistory.filter(chat =>
    chat.messages.some(msg => msg.text.toLowerCase().includes(keyword.toLowerCase()))
  );
  renderSearchResults(results);
}

function renderChat(messages) {
  const chatBox = document.getElementById("chatContainer");
  if (!chatBox) return;
  
  if (!messages.length) {
    const username = ChatApp.userData.username;
    chatBox.innerHTML = `
      <h2>Hello, <span id="userName2">${username}</span></h2>
      <p>Welcome to <strong>Chátmosphere</strong>, how can we help you today?</p>
    `;
    return;
  }
  
  chatBox.innerHTML = messages.map(msg => {
    const messageClass = msg.sender === "User" ? "user-message" : "bot-message";
    const displayText = msg.isLoading ? "<em>Typing...</em>" : msg.text;
    return `
      <div class="chat-message ${messageClass}">
        <strong>${msg.sender}:</strong> ${displayText}
      </div>
    `;
  }).join("");
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderHistory() {
  const historySection = document.querySelector(".history-section");
  if (!historySection) return;
  
  if (ChatApp.chatHistory.length === 0) {
    historySection.innerHTML = `<h3>🕘 History</h3><p class="no-history">No chat history yet</p>`;
    return;
  }
  
  const historyItems = ChatApp.chatHistory.map(chat => {
    return `
      <div class="history-item" onclick="ChatApp.loadChat(${chat.id})">
        <div class="history-preview">${chat.preview}</div>
      </div>
    `;
  }).join("");
  
  historySection.innerHTML = `<h3>🕘 History</h3><div class="history-list">${historyItems}</div>`;
}

function renderRecentChats() {
  const recentList = document.getElementById("chatHistory");
  if (!recentList) return;
  
  if (ChatApp.recentChats.length === 0) {
    recentList.innerHTML = `
      <li class="no-recent">No recent chats</li>
      <li class="auto-delete-notice">⚠️ Chats here auto-delete after 24 hours</li>
    `;
    return;
  }
  
  const chatItems = ChatApp.recentChats.map(chat => {
    const timeAgo = getTimeAgo(chat.timestamp);
    return `
      <li class="recent-chat-item" onclick="ChatApp.loadChat(${chat.id})">
        <div class="recent-preview">${chat.preview}</div>
        <div class="recent-time">${timeAgo}</div>
      </li>
    `;
  }).join("");
  
  recentList.innerHTML = chatItems + `<li class="auto-delete-notice">⚠️ Chats here auto-delete after 24 hours</li>`;
}

function renderSearchResults(results) {
  const historySection = document.querySelector(".history-section");
  if (!historySection) return;
  
  if (results.length === 0) {
    historySection.innerHTML = `<h3>🔍 Search Results</h3><p class="no-results">No matching chats found</p>`;
    return;
  }
  
  const resultItems = results.map(chat => {
    return `
      <div class="history-item search-result" onclick="ChatApp.loadChat(${chat.id})">
        <div class="history-preview">${chat.preview}</div>
      </div>
    `;
  }).join("");
  
  historySection.innerHTML = `<h3>🔍 Search Results (${results.length})</h3><div class="history-list">${resultItems}</div>`;
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

function setupEventListeners() {
  const chatForm = document.getElementById("chatForm");
  if (chatForm) {
    const newForm = chatForm.cloneNode(true);
    chatForm.parentNode.replaceChild(newForm, chatForm);
    
    newForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  const newChatBtn = document.getElementById("newChatBtn");
  if (newChatBtn) {
    const newBtn = newChatBtn.cloneNode(true);
    newChatBtn.parentNode.replaceChild(newBtn, newChatBtn);
    
    newBtn.addEventListener("click", startNewChat);
  }

  const searchInput = document.querySelector(".search-chat");
  if (searchInput) {
    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);
    
    newInput.addEventListener("input", (e) => {
      const keyword = e.target.value.trim();
      searchChats(keyword);
    });
  }

  const learnMoreBtn = document.querySelector(".learn-more");
  const modal = document.getElementById("learnMoreModal");
  const closeModal = document.querySelector(".close-modal");

  if (learnMoreBtn && modal && closeModal) {
    learnMoreBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    closeModal.addEventListener("click", () => modal.classList.add("hidden"));
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    ChatApp.loadData();
    initUserProfile();
    renderHistory();
    renderRecentChats();
    setupEventListeners();

    setInterval(() => {
      ChatApp.cleanupRecentChats();
      renderRecentChats();
    }, 60000);

    console.log("ChatApp initialized successfully!");
  }, 100);
});

window.ChatApp = ChatApp