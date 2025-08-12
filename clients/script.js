document.addEventListener("DOMContentLoaded", () => {
  // ====== USER PROFILE SETUP ======
  const username1 = localStorage.getItem("chatUsername") || "User";
  const username2 = localStorage.getItem("chatUsername") || "User";
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

  if (chatForm && chatContainer && userInput) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;

      // Show user's message
      addMessage(username1, message, "user");
      userInput.value = "";

      // Show loading message from bot
      const loadingElem = addMessage("Chátmosphere", "...", "bot");

      // Fetch bot reply from backend
      const botReply = await fetchBotResponse(message);

      // Replace loading with real message
      updateMessage(loadingElem, botReply);
    });
  }

  // ===== MESSAGE HELPERS =====
  function addMessage(sender, text, type) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type);
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    if (chatContainer) {
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    return msgDiv; // return element so we can update it later
  }

  function updateMessage(msgElement, newText) {
    if (msgElement) {
      msgElement.innerHTML = `<strong>Chátmosphere:</strong> ${newText}`;
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
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

  // ===== SIDEBAR COLLAPSE / EXPAND LOGIC =====
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector(".close-sidebar");
  const logo = document.querySelector(".logo");
  const newChatBtn = document.getElementById("newChatBtn");

  // safe-guards
  if (!sidebar) return;

  // Helper: split leading glyph (emoji/char) from the rest of text and wrap into spans
  function splitLeadingIcon(el) {
    if (!el || el.dataset.sfSplitDone) return;
    const original = el.textContent || "";
    const trimmed = original.trim();
    if (!trimmed) return;
    // Use Array.from to correctly handle emoji as single grapheme
    const chars = Array.from(trimmed);
    const first = chars[0] || "";
    const rest = chars.slice(1).join("").trim();

    // If element already contains children (like <h3> inside label) avoid double processing
    // We'll clear and re-create icon/text nodes
    el.textContent = ""; // clear 
const iconSpan = document.createElement("span");
iconSpan.className = "sf-icon";
iconSpan.textContent = first; // first letter
el.appendChild(iconSpan);

if (rest) {
  const textSpan = document.createElement("span");
  textSpan.className = "sf-text";
  textSpan.textContent = rest; // <-- removed the extra space here
  el.appendChild(textSpan);
}

el.dataset.sfSplitDone = "1";

  }

  // Apply splitting to candidate sidebar items (runs at load)
  function prepareSidebarItems() {
    // target buttons, labels, headings that normally have text+emoji
    const candidates = sidebar.querySelectorAll(
      ".sidebar-actions button, .sidebar-actions label, .history-section h3, .recent-container h3, #newChatBtn, .upload-label, .learn-more, .sidebar-footer strong"
    );
    candidates.forEach((el) => splitLeadingIcon(el));
  }
  prepareSidebarItems();

  // Inline SVG data URL for hamburger (white stroking so it shows on dark bg)
  const hamburgerSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48'><g fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/></g></svg>`;
  const hamburgerDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(hamburgerSvg);

  // remember original logo src to restore later
  if (logo && !logo.dataset.origSrc) {
    logo.dataset.origSrc = logo.src || "";
    logo.dataset.hamburger = hamburgerDataUrl;
  }

  // collapse helper
  function collapseSidebar() {
    sidebar.classList.add("collapsed");
    localStorage.setItem("sidebarCollapsed", "1");
  }
  // expand helper
  function expandSidebar() {
    sidebar.classList.remove("collapsed");
    localStorage.removeItem("sidebarCollapsed");
  }

  // initialize from saved state
  if (localStorage.getItem("sidebarCollapsed") === "1") {
    collapseSidebar();
  }

  // close button toggles (collapse)
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      collapseSidebar();
    });
  }

  // Logo interactions:
  // - If collapsed: hover => show hamburger (swap src), click => expand
  // - If not collapsed: click => start new chat
  if (logo) {
    logo.style.cursor = "pointer";

    logo.addEventListener("mouseenter", () => {
      if (sidebar.classList.contains("collapsed")) {
        // transient swap to hamburger svg
        logo.dataset.savedClass = logo.className || "";
        logo.classList.add("swaping");
        if (logo.dataset.hamburger) {
          logo.src = logo.dataset.hamburger;
        }
      }
    });

    logo.addEventListener("mouseleave", () => {
      if (sidebar.classList.contains("collapsed")) {
        // restore original
        logo.className = logo.dataset.savedClass || "";
        logo.src = logo.dataset.origSrc || logo.src;
      }
    });

    logo.addEventListener("click", (e) => {
      // if collapsed => expand
      if (sidebar.classList.contains("collapsed")) {
        expandSidebar();
        // restore logo in case it was swapped
        logo.src = logo.dataset.origSrc || logo.src;
        return;
      }
      // if not collapsed => start new chat (trigger the existing button)
      if (newChatBtn) {
        newChatBtn.click();
      }
    });
  }

  // When sidebar is clicked in the area, if user clicks outside control, do nothing.
  // (Optional) Clicking any icon while collapsed could open it - we won't do that by default.

  // Accessibility: allow pressing Escape to collapse sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // toggle collapse on Escape
      if (sidebar.classList.contains("collapsed")) expandSidebar();
      else collapseSidebar();
    }
  });

  // Re-run prepareSidebarItems if DOM changes (e.g., chat history items added)
  // Use a MutationObserver for the sidebar (lightweight)
  const mo = new MutationObserver((mutations) => {
    // if new nodes added, try to prepare them
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        prepareSidebarItems();
      }
    }
  });
  mo.observe(sidebar, { childList: true, subtree: true });
});
