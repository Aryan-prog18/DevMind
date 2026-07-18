# 🚀 DevMind

> AI-powered repository analysis and code assistant built with React, FastAPI, and LLMs.

DevMind helps developers understand unfamiliar codebases instantly. Simply paste a public GitHub repository URL, analyze the project, and ask natural language questions about the codebase.

---

## ✨ Features

- 📦 Analyze any public GitHub repository
- 🤖 AI-powered repository Q&A
- ⚡ Streaming AI responses
- 📝 Beautiful Markdown rendering
- 💻 Syntax-highlighted code blocks
- 📂 Repository metadata extraction
- 🏗 Framework detection
- 📚 Dependency analysis
- 🌐 Modern React UI
- 🚀 Live deployment with Vercel + Render

---

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Markdown
- Remark GFM

### Backend

- FastAPI
- Python
- GitPython
- Ollama *(Local Development)*
- Render

### Deployment

- Frontend → Vercel
- Backend → Render

---


## 📂 Project Structure

```
DevMind
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── ...
│
├── backend
│   ├── app
│   ├── routes
│   ├── services
│   ├── models
│   └── ...
│
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/Aryan-prog18/DevMind.git
cd DevMind
```

---

### Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 🌍 Live Demo

Frontend

```
https://dev-mind-lxfxce4ru-devmind1.vercel.app
```

Backend

```
https://devmind-j0x5.onrender.com
```

---

## 💡 How It Works

1. User enters a GitHub repository URL.
2. Backend clones and analyzes the repository.
3. Repository context is generated.
4. AI receives the repository context.
5. User asks questions.
6. AI answers using the analyzed project.

---

## 📌 Future Improvements

- 🔍 Repository search
- 📋 Copy code button
- 📂 Repository history
- ⭐ Save favorite repositories
- 🌙 Improved dark mode
- 🤖 Cloud-hosted LLM integration (Groq/OpenAI)
- 📱 Mobile optimization

---

## 👨‍💻 Author

**Aryan**

GitHub

https://github.com/Aryan-prog18

---


---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
