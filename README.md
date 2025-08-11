# 🌟 Chátmosphere

> **AI Chatbot Web Application** - A collaborative team project

A modern chatbot interface built with OpenRouter API integration, featuring intelligent conversations, history management, and seamless user experience.

---

## 🚀 Quick Overview

**Chátmosphere** is a ChatGPT-like web application developed by a 4-person team. Each member handles specific features while maintaining a cohesive user experience.

### ✨ **Key Features**
- 💬 AI-powered conversations via OpenRouter
- 📚 Smart chat history and search
- 🔗 Chat sharing and export capabilities  
- 👤 User identity management
- 📱 Responsive navbar with collapse/expand

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **AI Service** | OpenRouter API |
| **Styling** | Custom CSS with responsive design |
| **Storage** | Local browser storage + in-memory sessions |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- OpenRouter API key

### 🚀 Quick Start
```bash
# Clone repository
git clone https://github.com/Alagham/Chatmosphere.git
cd chatmosphere

# Install dependencies
npm install express cors dotenv openai

# Configure environment
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Start server
node server.js
```

**Access**: Open `index.html` in browser (server runs on `localhost:3000`)

---

## 📁 Project Structure

```
chatmosphere/
├── 📄 index.html          # Main application file
├── 🎨 index.css           # Styling and themes  
├── 🧠 chat.js             # Chat management (Afeez)
├── ⚙️ script.js           # Basic functionality
├── 🖥️ server.js           # Backend API server
├── 📷 assets/             # Logo and images
├── 🔐 .env                # API keys
└── 📖 README.md           # This file
```

---

## ⚡ Key Features in Detail

### 🧠 **Smart Chat Management**
- Auto-save conversations to history
- 24-hour recent chat cleanup
- Keyword search across all sessions
- Session persistence and reload

### 🎨 **Responsive Interface**
- Collapsible navbar with icon-only mode
- Smooth animations and transitions
- Mobile-friendly design
- Consistent theming

### 🔗 **Sharing & Export**
- PDF generation for conversations
- Shareable link creation
- Archive system for organization
- Per-chat action menus

---

## 📄 License

MIT License - See LICENSE file for details

---

<div align="center">

**🌟 Built collaboratively by the Chátmosphere Team**

*Halimah • Afeez • Bolaji • Hamza*

</div>