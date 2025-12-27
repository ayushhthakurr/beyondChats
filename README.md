# BeyondChats Article Automation System

A complete article scraping, optimization, and display system with three distinct components working together through a REST API.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Task 1: Scrape & Store Articles](#task-1-scrape--store-articles)
- [Task 2: Generate Optimized Articles](#task-2-generate-optimized-articles)
- [Task 3: Frontend Display](#task-3-frontend-display)
- [How to Run](#how-to-run)
- [System Architecture](#system-architecture)
- [API Reference](#api-reference)

---

## Overview

This system implements three independent but connected tasks:

1. **Scrape oldest articles** from BeyondChats blog → Store in database via API
2. **Fetch latest article** → Search Google → Scrape competitors → Generate improved version with LLM → Publish with citations
3. **Display articles** in a React frontend with clear visual distinction between original and generated content

**Technology Stack:** Node.js, Express, SQLite, React, TypeScript, Groq LLM API

---

## Project Structure

```
beyondchats/
├── backend/                    # Express API + SQLite database
│   ├── src/
│   │   ├── server.js          # Main server entry point
│   │   ├── controllers/       # API request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   └── db/                # Database setup
│   ├── articles.db            # SQLite database (created on first run)
│   └── package.json
│
├── scripts/                   # Automation scripts (Tasks 1 & 2)
│   ├── src/
│   │   ├── index.js          # Main entry point (runs both tasks)
│   │   │
│   │   # TASK 1 FILES:
│   │   ├── scrape.js         # Scrapes oldest articles from BeyondChats
│   │   ├── rewrite.js        # Saves scraped articles to backend
│   │   │
│   │   # TASK 2 FILES:
│   │   ├── fetchLatest.js    # Fetches latest article from backend
│   │   ├── googleSearch.js   # Searches Google & scrapes competitors
│   │   ├── llmRewriter.js    # Rewrites article using Groq LLM
│   │   └── publishArticle.js # Publishes generated article to backend
│   │
│   ├── .env                   # Configuration (API keys)
│   └── package.json
│
├── frontend/                  # React + TypeScript UI
│   ├── src/
│   │   ├── App.tsx           # Main component with all logic
│   │   ├── App.css           # Styling
│   │   └── main.tsx          # Entry point
│   └── package.json
│
├── docs/
│   └── architecture.jpeg      # Visual architecture diagram
│
└── README.md                  # This file
```

**Key Points:**
- Only **3 top-level folders**: `backend/`, `scripts/`, `frontend/`
- `scripts/` contains BOTH Task 1 and Task 2 in a single automated flow
- Clear file names indicate purpose
- No duplicate or test files

---

## Task 1: Scrape & Store Articles

### What It Does

1. Loads https://beyondchats.com/blogs/
2. Detects pagination and navigates to the **last page** (oldest articles)
3. Scrapes the **5 oldest articles**
4. Saves them to the database via backend CRUD API

### Files Involved

| File | Purpose |
|------|---------|
| `scripts/src/scrape.js` | Scraping logic with cheerio |
| `scripts/src/rewrite.js` | Sends articles to backend API |
| `scripts/src/index.js` | Orchestrates the flow |

### Flow

```
BeyondChats Blog
    ↓
scrape.js (extract articles)
    ↓
rewrite.js (POST to /api/articles)
    ↓
Backend API
    ↓
SQLite Database
```

### Database Schema

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT DEFAULT 'beyondchats',
  is_generated INTEGER DEFAULT 0,
  original_article_id TEXT,
  references TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

---

## Task 2: Generate Optimized Articles

### What It Does

1. **Fetches** the latest article from backend API
2. **Searches** Google for the article title
3. **Scrapes** the first 2 blog/article results from Google
4. **Calls Groq LLM** to rewrite the original article by:
   - Analyzing competitor content
   - Improving formatting and comprehensiveness
   - Matching style of top-ranking content
5. **Publishes** the generated article back to backend
6. **Cites** the 2 competitor articles at the bottom

### Files Involved

| File | Purpose |
|------|---------|
| `scripts/src/fetchLatest.js` | GET latest article from backend |
| `scripts/src/googleSearch.js` | Google search + scrape competitors |
| `scripts/src/llmRewriter.js` | LLM API call (Groq) |
| `scripts/src/publishArticle.js` | POST generated article to backend |
| `scripts/src/index.js` | Orchestrates the flow |

### Flow

```
Backend API (GET /api/articles)
    ↓
fetchLatest.js (get latest article)
    ↓
googleSearch.js (search + scrape 2 competitors)
    ↓
llmRewriter.js (call Groq LLM API)
    ↓
publishArticle.js (POST /api/articles)
    ↓
Backend API
    ↓
Database (with references field populated)
```

### LLM Integration

- **API Used:** Groq (free tier with generous limits)
- **Model:** Llama 3.1 70B Versatile
- **Fallback:** If no API key, uses demo mode
- **Get API Key:** https://console.groq.com/keys

### How Generated Articles Are Tracked

- `is_generated = 1` → Marks AI-generated content
- `original_article_id` → Links to source article
- `references` → JSON array of competitor URLs
- `source_type = 'llm_generated'`

---

## Task 3: Frontend Display

### What It Does

Displays all articles (original and generated) in a clean, responsive React interface.

### Features

- **List View:** All articles as clickable cards
- **Visual Distinction:**
  - Original articles → Blue border
  - Generated articles → Purple border
- **Detail View:** Full content with metadata
- **References:** Shows cited sources for generated articles
- **Relationship Links:** Navigate between original ↔ generated
- **Responsive Design:** Works on all screen sizes

### Files Involved

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Main component (list + detail views) |
| `frontend/src/App.css` | All styling |
| `frontend/src/main.tsx` | Renders React app |

### API Endpoints Used

- `GET http://localhost:3000/api/articles` → Fetch all articles

---

## How to Run

### Prerequisites

- Node.js 14+ installed
- npm installed

### Step 1: Start Backend Server

```bash
cd backend
npm install
npm start
```

**Expected output:**
```
Server running on http://localhost:3000
```

**Keep this terminal running!**

---

### Step 2: Run Scripts (Tasks 1 & 2)

Open a **new terminal** and run:

```bash
cd scripts
npm install
npm start
```

**What happens:**
1. Scrapes 5 oldest articles from BeyondChats (Task 1)
2. Saves them to database
3. Fetches latest article (Task 2)
4. Searches Google for competitors
5. Generates optimized version with LLM
6. Saves generated article with citations

**Expected output:**
```
=== Starting BeyondChats Article Automation ===

📋 MODE: Scraping new articles from BeyondChats...
✔ Found 5 articles
✔ New articles saved to backend

============================================================
📝 MODE: Processing latest article with SEO optimization...

✔ Latest article: "Can Chatbots Boost Small Business Growth?"
📍 Starting Google search...
✔ Scraped 2 articles from Google search results
🤖 Calling LLM to rewrite article...
✔ Article successfully rewritten by LLM (Groq)
📤 Publishing enhanced article to backend...
✔ Article published successfully!

🎉 SUCCESS! Article optimization complete.
```

---

### Step 3: Start Frontend

Open a **third terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

Open your browser to: **http://localhost:5173**

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│  BeyondChats    │
│   Blog (Web)    │
└────────┬────────┘
         │
         ↓ (Task 1: Scrape)
┌─────────────────┐       ┌──────────────┐
│  Scripts        │←─────→│  Backend     │
│  (Automation)   │  API  │  (Express)   │
└────────┬────────┘       └──────┬───────┘
         │                       │
         ↓ (Task 2)              ↓
┌─────────────────┐       ┌──────────────┐
│  Google Search  │       │  SQLite DB   │
│  + Groq LLM     │       │  (articles)  │
└─────────────────┘       └──────┬───────┘
                                 │
                                 ↓ (Task 3)
                          ┌──────────────┐
                          │   Frontend   │
                          │   (React)    │
                          └──────────────┘
```

### Data Flow

**Task 1 Flow:**
```
BeyondChats → scrape.js → rewrite.js → Backend API → Database
```

**Task 2 Flow:**
```
Database → fetchLatest.js → googleSearch.js → llmRewriter.js → publishArticle.js → Database
```

**Task 3 Flow:**
```
Database → Backend API → Frontend (React) → Browser
```

See `docs/architecture.jpeg` for visual diagram.

---

## API Reference

### Backend Endpoints

#### GET `/api/articles`
Returns all articles (newest first)

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Article Title",
    "content": "Full article content...",
    "source_url": "https://beyondchats.com/blogs/article",
    "source_type": "beyondchats",
    "is_generated": 0,
    "original_article_id": null,
    "references": null,
    "created_at": "2025-12-27T00:00:00.000Z",
    "updated_at": "2025-12-27T00:00:00.000Z"
  }
]
```

#### GET `/api/articles/:id`
Returns a single article by ID

#### POST `/api/articles`
Creates a new article

**Request body:**
```json
{
  "title": "Article Title",
  "content": "Article content...",
  "source_url": "https://example.com",
  "source_type": "beyondchats",
  "is_generated": 0
}
```

#### PATCH `/api/articles/:id`
Updates an existing article

#### DELETE `/api/articles/:id`
Deletes an article

---

## Configuration

### Environment Variables (`scripts/.env`)

```bash
# LLM API (Groq - Free)
GROQ_API_KEY=gsk_xxxxx

# Backend URL
BACKEND_URL=http://localhost:3000

# Optional: Google Search APIs
SERPAPI_KEY=xxxxx                    # serpapi.com (100 free/month)
GOOGLE_SEARCH_API_KEY=xxxxx          # Google Custom Search
GOOGLE_SEARCH_ENGINE_ID=xxxxx
```

**Get Free API Keys:**
- Groq: https://console.groq.com/keys (required for Task 2)
- SerpAPI: https://serpapi.com (optional, improves Google search)

---

## Troubleshooting

### Backend not starting
- **Issue:** Port 3000 already in use
- **Solution:** Kill process: `lsof -ti:3000 | xargs kill -9`

### No articles in database
- **Issue:** Database is empty
- **Solution:** Run `cd scripts && npm start` to scrape articles

### "Using demo rewrite mode"
- **Issue:** GROQ_API_KEY not configured
- **Solution:** Add API key to `scripts/.env`

### Frontend errors
- **Issue:** Cannot connect to backend
- **Solution:** Ensure backend is running on port 3000

### "Using demo competitor articles"
- **Issue:** Google search API not configured (normal)
- **Solution:** System uses fallback demo mode or DuckDuckGo. For production, add SERPAPI_KEY

---

## Next Steps (Future Enhancements)

- Add automated tests
- Implement real-time Google search with proper API
- Add authentication and user management
- Deploy to production (Vercel + Railway)
- Add article scheduling and automated generation
- Implement caching for better performance
