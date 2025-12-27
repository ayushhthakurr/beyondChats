# Quick Start Guide

Get the entire system running in 3 steps.

## Prerequisites

- Node.js 14+ installed
- Get a free Groq API key: https://console.groq.com/keys

---

## Step 1: Start Backend (Terminal 1)

```bash
cd backend
npm install
npm start
```

✅ You should see: `Server running on http://localhost:3000`

**Keep this terminal open!**

---

## Step 2: Run Automation Scripts (Terminal 2)

```bash
cd scripts
npm install
npm start
```

> **Note:** The `.env` file with free API keys is already included for your convenience!

This will:
1. Scrape 5 oldest articles from BeyondChats blog
2. Save them to database
3. Generate an optimized version of the latest article using LLM
4. Save the generated article with references

✅ You should see: `🎉 SUCCESS! Article optimization complete.`

---

## Step 3: Start Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

✅ Open your browser to: **http://localhost:5173**

You should see:
- Original articles (blue border)
- Generated articles (purple border)
- Click any article to view full content
- Generated articles show references at the bottom

---

## Troubleshooting

**Backend won't start?**
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9
```

**No Groq API key?**
- Get free key at: https://console.groq.com/keys
- Add to `scripts/.env`: `GROQ_API_KEY=your_key_here`

**Frontend can't connect?**
- Make sure backend is running on port 3000
- Check: http://localhost:3000/api/articles

---

## What You Should See

### Terminal 1 (Backend)
```
Server running on http://localhost:3000
```

### Terminal 2 (Scripts)
```
=== Starting BeyondChats Article Automation ===

📋 MODE: Scraping new articles from BeyondChats...
✔ Found 5 articles
✔ New articles saved to backend

============================================================
📝 MODE: Processing latest article with SEO optimization...

✔ Latest article: "Can Chatbots Boost Small Business Growth?"
🤖 Calling LLM to rewrite article...
✔ Article successfully rewritten by LLM (Groq)

🎉 SUCCESS! Article optimization complete.
```

### Terminal 3 (Frontend)
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Browser
- List of articles with blue/purple borders
- Click to view full content
- Generated articles show references

---

## File Structure Reference

```
beyondchats/
├── backend/         # API Server (Terminal 1)
├── scripts/         # Automation (Terminal 2)  
└── frontend/        # React App (Terminal 3)
```

---

That's it! The system is now fully operational.

For detailed documentation, see the main [README.md](README.md)

