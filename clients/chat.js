const ChatApp = {
  currentSession: [],
  chatHistory: [],
  recentChats: [],
  userData: {
    username: "User",
    userImage: null
  },

  saveCurrentChat() {
    // Only save if there are actual messages
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
    // Always clear current session regardless
    this.currentSession = [];
  },

  cleanupRecentChats() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.recentChats = this.recentChats.filter(c => c.timestamp > cutoff);
  },

  persistData() {
    // Using in-memory storage instead of localStorage
    // Data will persist during the session but reset on page reload
    console.log("Data persisted in memory:", {
      historyCount: this.chatHistory.length,
      recentCount: this.recentChats.length
    });
  },

  loadData() {
    // Initialize with empty data since we can't use localStorage
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
  const username = ChatApp.userData.username;
  const userName1 = document.getElementById("userName1");
  const userName2 = document.getElementById("userName2");
  
  if (userName1) userName1.textContent = username;
  if (userName2) userName2.textContent = username;

  if (ChatApp.userData.userImage) {
    const avatar = document.querySelector(".avatar-placeholder");
    if (avatar) {
      avatar.innerHTML = `<img src="${ChatApp.userData.userImage}" alt="User Avatar" class="user-avatar" />`;
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
  
  // Add user message to chat
  addMessage("User", text);
  userInput.value = "";
  
  try {
    // Call your API
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Add AI response to chat
    addMessage("Chátmosphere", data.reply);
    
  } catch (error) {
    console.error('API Error:', error);
    addMessage("Chátmosphere", "Sorry, I'm having trouble connecting right now. Please try again.");
  }
}

function startNewChat() {
  // Save current chat to history if it has messages
  ChatApp.saveCurrentChat();
  // Clear current session and render fresh interface
  ChatApp.currentSession = [];
  renderChat([]);
  
  // Clear search if active
  const searchInput = document.querySelector(".search-chat");
  if (searchInput) {
    searchInput.value = "";
    renderHistory(); // Show full history again, not search results
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
    return `
      <div class="chat-message ${messageClass}">
        <strong>${msg.sender}:</strong> ${msg.text}
      </div>
    `;
  }).join("");
  
  // Scroll to bottom
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
    const date = new Date(chat.timestamp).toLocaleDateString();
    return `
      <div class="history-item" onclick="ChatApp.loadChat(${chat.id})">
        <div class="history-preview">${chat.preview}</div>
        <div class="history-date">${date}</div>
        <button class="delete-chat" onclick="event.stopPropagation(); ChatApp.deleteChat(${chat.id})">🗑</button>
      </div>
    `;
  }).join("");
  
  historySection.innerHTML = `<h3>🕘 History</h3>${historyItems}`;
}

function renderRecentChats() {
  const recentList = document.getElementById("chatHistory");
  if (!recentList) return;
  
  if (ChatApp.recentChats.length === 0) {
    recentList.innerHTML = `<li class="no-recent">No recent chats</li>`;
    return;
  }
  
  recentList.innerHTML = ChatApp.recentChats.map(chat => {
    const timeAgo = getTimeAgo(chat.timestamp);
    return `
      <li class="recent-chat-item" onclick="ChatApp.loadChat(${chat.id})">
        <div class="recent-preview">${chat.preview}</div>
        <div class="recent-time">${timeAgo}</div>
      </li>
    `;
  }).join("");
}

function renderSearchResults(results) {
  const historySection = document.querySelector(".history-section");
  if (!historySection) return;
  
  if (results.length === 0) {
    historySection.innerHTML = `<h3>🔍 Search Results</h3><p class="no-results">No matching chats found</p>`;
    return;
  }
  
  const resultItems = results.map(chat => {
    const date = new Date(chat.timestamp).toLocaleDateString();
    return `
      <div class="history-item search-result" onclick="ChatApp.loadChat(${chat.id})">
        <div class="history-preview">${chat.preview}</div>
        <div class="history-date">${date}</div>
      </div>
    `;
  }).join("");
  
  historySection.innerHTML = `<h3>🔍 Search Results (${results.length})</h3>${resultItems}`;
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

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  ChatApp.loadData();
  initUserProfile();
  renderHistory();
  renderRecentChats();

  // New Chat button event listener
  const newChatBtn = document.getElementById("newChatBtn");
  if (newChatBtn) {
    newChatBtn.addEventListener("click", startNewChat);
  }

  // Search functionality
  const searchInput = document.querySelector(".search-chat");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.trim();
      searchChats(keyword);
    });
  }

  // Chat form submission - THIS IS THE SEND BUTTON EVENT LISTENER
  const chatForm = document.getElementById("chatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sendMessage(); // This calls your API function
    });
  }

  // Cleanup recent chats every minute
  setInterval(() => {
    ChatApp.cleanupRecentChats();
    renderRecentChats();
  }, 60000);
});

// Make functions available globally for onclick handlers
window.ChatApp = ChatApp;
