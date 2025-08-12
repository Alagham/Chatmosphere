document.addEventListener("DOMContentLoaded", () => {
  // ====== USER PROFILE SETUP ======
  // use a single base username value, but keep username1/username2 variables for backwards compatibility
  const _usernameBase = localStorage.getItem("chatUsername") || "User";
  const username1 = _usernameBase;
  const username2 = _usernameBase;
  const userImage = localStorage.getItem("chatUserImage");

  const userName1El = document.getElementById("userName1");
  const userName2El = document.getElementById("userName2");
  if (userName1El) userName1El.textContent = username1;
  if (userName2El) userName2El.textContent = username2;

  const avatar = document.querySelector(".avatar-placeholder");
  if (avatar && userImage) {
    avatar.innerHTML = `<img src="${userImage}" alt="Avatar" style="width:30px;height:30px;border-radius:50%;">`;
  }
  const proBadge = document.querySelector(".pro-badge");
  if (proBadge) proBadge.style.display = "none";

  // ===== UNIQUE STORAGE KEY FOR USER =====
  const storageKey = `chatHistoryData_${_usernameBase}`;

  // ===== MODAL =====
  const learnMoreBtn = document.querySelector(".learn-more");
  const modal = document.getElementById("learnMoreModal");
  const closeModal = document.querySelector(".close-modal");

  if (learnMoreBtn && modal) {
    learnMoreBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  }
  if (closeModal && modal) {
    closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  }
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // ===== CHAT FUNCTIONALITY =====
  const chatForm = document.getElementById("chatForm");
  const chatContainer = document.getElementById("chatContainer");
  const userInput = document.getElementById("userInput");

  // ====== CHAT STORAGE SYSTEM (per-user) ======
  let allChats = JSON.parse(localStorage.getItem(storageKey)) || [];
  let currentChatId = null;
  const chatHistoryEl = document.getElementById("chatHistory");
  const searchInput = document.querySelector(".search-chat");
  const newChatBtn = document.getElementById("newChatBtn");

  function formatTime(ts) {
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderChats() {
    if (!chatHistoryEl) return;
    chatHistoryEl.innerHTML = "";
    const now = Date.now();
    // recent = within 24 hours
    const recentChats = allChats.filter(chat => now - chat.timestamp <= 24 * 60 * 60 * 1000);

    if (recentChats.length === 0) {
      chatHistoryEl.innerHTML = `<li class="no-recent">No recent chats</li>`;
      return;
    }

    recentChats.forEach(chat => {
      const li = document.createElement("li");
      li.classList.add("recent-chat-item");
      const timeStr = formatTime(chat.timestamp);
      li.innerHTML = `<div class="recent-preview">${chat.title}</div>
                      <div class="recent-time">${timeStr}</div>`;
      li.addEventListener("click", () => loadChat(chat.id));
      chatHistoryEl.appendChild(li);
    });
  }

  function saveCurrentChat() {
    if (!chatContainer) return;
    const messages = [...chatContainer.querySelectorAll(".message")].map(m => m.textContent);
    if (messages.length === 0) return;

    let chat = allChats.find(c => c.id === currentChatId);
    if (!chat) {
      chat = {
        id: currentChatId,
        title: messages[0].slice(0, 30) + (messages[0].length > 30 ? "..." : ""),
        timestamp: Date.now(),
        messages: []
      };
      allChats.push(chat);
    }
    chat.messages = messages;
    chat.timestamp = Date.now();

    localStorage.setItem(storageKey, JSON.stringify(allChats));
    renderChats();
  }

  function loadChat(id) {
    const chat = allChats.find(c => c.id === id);
    if (!chat) return;
    currentChatId = id;
    if (!chatContainer) return;
    chatContainer.innerHTML = "";
    chat.messages.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("message");
      div.textContent = msg;
      chatContainer.appendChild(div);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      if (!term) {
        renderChats();
        return;
      }
      if (!chatHistoryEl) return;
      chatHistoryEl.innerHTML = "";
      const matches = allChats.filter(chat =>
        chat.title.toLowerCase().includes(term) ||
        chat.messages.some(m => m.toLowerCase().includes(term))
      );
      if (matches.length === 0) {
        chatHistoryEl.innerHTML = `<li class="no-results">No matching chats</li>`;
        return;
      }
      matches.forEach(chat => {
        const li = document.createElement("li");
        li.classList.add("recent-chat-item", "search-result");
        li.innerHTML = `<div class="recent-preview">${chat.title}</div>
                        <div class="recent-time">${formatTime(chat.timestamp)}</div>`;
        li.addEventListener("click", () => loadChat(chat.id));
        chatHistoryEl.appendChild(li);
      });
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      if (currentChatId) saveCurrentChat();
      currentChatId = "chat_" + Date.now();
      if (chatContainer) {
        chatContainer.innerHTML = `<h2>Hello, <span id="userName2">${username1}</span></h2>
                                   <p>Welcome to <strong>Chátmosphere</strong>, how can we help you today?</p>`;
      }
    });
  }

  // ===== MESSAGE HELPERS =====
  function addMessage(sender, text, type) {
    if (!chatContainer) return null;
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type);
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    saveCurrentChat(); // Save chat on every new message
    return msgDiv;
  }

  function updateMessage(msgElement, newText) {
    if (msgElement) {
      msgElement.innerHTML = `<strong>Chátmosphere:</strong> ${newText}`;
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      saveCurrentChat();
    }
  }

  async function fetchBotResponse(prompt) {
    try {
      const res = await fetch("https://chatmosphere.onrender.com/", {
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

  if (chatForm && chatContainer && userInput) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;

      if (!currentChatId) currentChatId = "chat_" + Date.now();

      const loadingElem = addMessage(username1, message, "user");
      userInput.value = "";

      const botElem = addMessage("Chátmosphere", "...", "bot");
      const botReply = await fetchBotResponse(message);
      updateMessage(botElem, botReply);
    });
  }

  // ===== SIDEBAR COLLAPSE / EXPAND LOGIC =====
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector(".close-sidebar");
  const logo = document.querySelector(".logo");

  if (!sidebar) {
    // still renderChats if sidebar missing? We continue, but many functions rely on DOM elements existing
  }

  function splitLeadingIcon(el) {
    if (!el || el.dataset.sfSplitDone) return;
    const original = el.textContent || "";
    const trimmed = original.trim();
    if (!trimmed) return;
    const chars = Array.from(trimmed);
    const first = chars[0] || "";
    const rest = chars.slice(1).join("").trim();
    el.textContent = "";
    const iconSpan = document.createElement("span");
    iconSpan.className = "sf-icon";
    iconSpan.textContent = first;
    el.appendChild(iconSpan);
    if (rest) {
      const textSpan = document.createElement("span");
      textSpan.className = "sf-text";
      textSpan.textContent = rest;
      el.appendChild(textSpan);
    }
    el.dataset.sfSplitDone = "1";
  }

  function prepareSidebarItems() {
    if (!sidebar) return;
    const candidates = sidebar.querySelectorAll(
      ".sidebar-actions button, .sidebar-actions label, .history-section h3, .recent-container h3, #newChatBtn, .upload-label, .learn-more, .sidebar-footer strong"
    );
    candidates.forEach((el) => splitLeadingIcon(el));
  }
  prepareSidebarItems();

  const hamburgerSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48'><g fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/></g></svg>`;
  const hamburgerDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(hamburgerSvg);

  if (logo && !logo.dataset.origSrc) {
    logo.dataset.origSrc = logo.src || "";
    logo.dataset.hamburger = hamburgerDataUrl;
  }

  function collapseSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("collapsed");
    localStorage.setItem("sidebarCollapsed", "1");
  }
  function expandSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("collapsed");
    localStorage.removeItem("sidebarCollapsed");
  }

  if (localStorage.getItem("sidebarCollapsed") === "1") {
    collapseSidebar();
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      collapseSidebar();
    });
  }

  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("mouseenter", () => {
      if (sidebar && sidebar.classList.contains("collapsed")) {
        logo.dataset.savedClass = logo.className || "";
        logo.classList.add("swaping");
        if (logo.dataset.hamburger) {
          logo.src = logo.dataset.hamburger;
        }
      }
    });
    logo.addEventListener("mouseleave", () => {
      if (sidebar && sidebar.classList.contains("collapsed")) {
        logo.className = logo.dataset.savedClass || "";
        logo.src = logo.dataset.origSrc || logo.src;
      }
    });
    logo.addEventListener("click", (e) => {
      if (sidebar && sidebar.classList.contains("collapsed")) {
        expandSidebar();
        logo.src = logo.dataset.origSrc || logo.src;
        return;
      }
      if (newChatBtn) {
        newChatBtn.click();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (sidebar && sidebar.classList.contains("collapsed")) expandSidebar();
      else collapseSidebar();
    }
  });

  const mo = new MutationObserver(() => {
    prepareSidebarItems();
  });
  if (sidebar) mo.observe(sidebar, { childList: true, subtree: true });

  // ===== INITIAL LOAD =====
  renderChats();

  // ===== SAVE ON PAGE EXIT =====
  window.addEventListener("beforeunload", saveCurrentChat);
});

// ===== SHARE BUTTON FUNCTIONALITY =====
// This section is outside DOMContentLoaded in your original file — re-query DOM elements here
const shareBtn = document.querySelector(".share-btn");
const sharePopup = document.getElementById("share-popup");
const cancelShareBtn = document.querySelector(".cancel-share");

const menuBtn = document.querySelector(".menu-btn");
const menuPopup = document.getElementById("menu-popup");

function closeAllPopups() {
  if (sharePopup) sharePopup.classList.add("hidden");
  if (menuPopup) menuPopup.classList.add("hidden");
}

if (shareBtn && sharePopup) {
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = sharePopup.classList.contains("hidden");
    closeAllPopups();
    if (isHidden) sharePopup.classList.remove("hidden");
  });
}

if (cancelShareBtn) {
  cancelShareBtn.addEventListener("click", () => {
    if (sharePopup) sharePopup.classList.add("hidden");
  });
}

if (menuBtn && menuPopup) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = menuPopup.classList.contains("hidden");
    closeAllPopups();
    if (isHidden) menuPopup.classList.remove("hidden");
  });
}

// Close popups if clicking outside
document.addEventListener("click", (e) => {
  const shareBtnEl = document.querySelector(".share-btn");
  const menuBtnEl = document.querySelector(".menu-btn");
  if (sharePopup && shareBtnEl && !sharePopup.contains(e.target) && !shareBtnEl.contains(e.target) &&
      menuPopup && menuBtnEl && !menuPopup.contains(e.target) && !menuBtnEl.contains(e.target)) {
    closeAllPopups();
  }
});

// ===== MENU BUTTON ACTIONS =====
if (menuPopup) {
  menuPopup.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.textContent.trim();
      if (action.includes("Archive")) {
        alert("Chat archived!"); // Replace with real archive logic
      } else if (action.includes("Report")) {
        alert("Reported conversation!"); // Replace with real report logic
      } else if (action.includes("Delete")) {
        if (confirm("Delete this conversation?")) {
          // Because chatContainer and currentChatId exist inside DOMContentLoaded scope,
          // re-query chatContainer and remove the current chat from storage if possible.
          const chatContainerLocal = document.getElementById("chatContainer");
          // try to remove the current chat from the user's stored chats
          const usernameBase = localStorage.getItem("chatUsername") || "User";
          const storageKeyLocal = `chatHistoryData_${usernameBase}`;
          let allChatsLocal = JSON.parse(localStorage.getItem(storageKeyLocal)) || [];
          // if there's a selected chat id stored in sessionStorage, use it; else attempt to infer
          const currentChatIdLocal = sessionStorage.getItem("currentChatId") || null;
          if (currentChatIdLocal) {
            allChatsLocal = allChatsLocal.filter(c => c.id !== currentChatIdLocal);
            localStorage.setItem(storageKeyLocal, JSON.stringify(allChatsLocal));
          } else {
            // fallback: if chatContainer has only one chat message set or contains 'Conversation deleted.',
            // just clear the visible chat container and leave storage untouched
            // (we avoid accidentally deleting wrong chat if we can't determine id)
          }
          if (chatContainerLocal) chatContainerLocal.innerHTML = `<p>Conversation deleted.</p>`;
        }
      }
      closeAllPopups();
    });
  });
}

// ===== SHARE BUTTON ACTIONS =====
const shareLinkBtn = document.querySelector(".share-link");
const shareTwitterBtn = document.querySelector(".share-twitter");
const shareFacebookBtn = document.querySelector(".share-facebook");
const shareWhatsAppBtn = document.querySelector(".share-whatsapp");
const shareNativeBtn = document.querySelector(".share-native");

const shareUrl = window.location.href; // Or use your generated public chat link

if (shareLinkBtn) {
  shareLinkBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy link.");
    });
  });
}

if (shareTwitterBtn) {
  shareTwitterBtn.addEventListener("click", () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, "_blank");
  });
}

if (shareFacebookBtn) {
  shareFacebookBtn.addEventListener("click", () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  });
}

if (shareWhatsAppBtn) {
  shareWhatsAppBtn.addEventListener("click", () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, "_blank");
  });
}

if (shareNativeBtn) {
  shareNativeBtn.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chátmosphere Chat",
          text: "Check out this chat!",
          url: shareUrl
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      alert("Native share not supported on this browser.");
    }
  });
}
