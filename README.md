## BeyondChats Article System

This project is a full-stack system that scrapes articles from the BeyondChats blog, generates enhanced versions using external references, and displays everything in a clean web interface.
It’s built as an end-to-end pipeline where each part has a clear responsibility: scraping, processing, storage, and presentation — all connected through a REST API.


## What This Project Does (High Level)

The system works in three clear phases:
1. Scrape articles from the BeyondChats blog
2. Generate AI-enhanced versions using external references
3. Display everything in a responsive frontend

Each phase is independent but connected through the backend API, which keeps the architecture clean and easy to extend.


## Phase 1: Article Scraping & Storage

### Goal

Fetch the 5 oldest articles from the BeyondChats blog and store them in a database using a backend API.

### How It Works

A standalone automation script handles scraping:

1. Loads the BeyondChats blog homepage
2. Detects pagination and finds the last page
3. Navigates to that page (where the oldest articles live)
4. Extracts article links
5. Scrapes the first 5 articles
6. Sends the data to the backend via REST API

The backend exposes CRUD APIs and stores everything in SQLite.

### Important Files

- `automation/src/index.js` – Entry point for the scraping flow
- `automation/src/scrape.js` – Scraping and parsing logic
- `automation/src/rewrite.js` – Sends scraped data to backend
- `backend/src/server.js` – Express server
- `backend/src/controllers/articleController.js` – API handlers
- `backend/src/models/articleModel.js` – Database logic
- `backend/src/db/database.js` – SQLite setup

### Database Schema

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT,
  is_generated INTEGER DEFAULT 0,
  parent_article_id TEXT,
  references TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

---

## Phase 2: AI Article Generation

### Goal

Automatically generate an enhanced version of an existing article using external references.

### Workflow

The generator script follows this flow:

1. Fetches the latest article from the backend
2. Searches Google using the article title
3. Extracts the first two relevant article/blog links
4. Scrapes content from those links
5. Generates an updated article (currently mocked)
6. Appends references at the end
7. Saves the generated article back to the backend

Generated articles are clearly linked to their originals.

### How Generated Articles Are Tracked

- `is_generated = 1` marks AI-generated content
- `parent_article_id` links back to the original article
- `references` stores the external source URLs

### LLM Integration

Right now, the generation logic is mocked to keep the project free and simple.
The structure is already set up for easy integration with OpenAI or Anthropic.

Replacing the mock logic with a real LLM requires minimal changes.

### Key File

- `article-generator/index.js` – Complete generation pipeline

---

## Phase 3: Frontend Display

### What the Frontend Does

A React + TypeScript web app that displays both original and generated articles.

### Features

- List view with clickable article cards
- Clear visual distinction:

    - Original articles → Blue
    - Generated articles → Purple
- Full article view with metadata
- Parent–child relationship links
- Reference links for generated articles
- Responsive layout for all screen sizes

### API Used

- `GET http://localhost:3000/api/articles`

### Key Files

- `frontend/src/App.tsx` – Main UI logic
- `frontend/src/App.css` – Styling
- `frontend/src/main.tsx` – Entry point

---

## Architecture Overview

### System Architecture

```
Scraper (Phase 1)
        ↓
Backend API (Express + SQLite)
        ↑
Generator (Phase 2)
        ↓
Frontend (Phase 3)
```

### Data Flow

Scraping

```
BeyondChats Blog → Scraper → Backend API → Database
```

Generation

```
Backend → Google Search → Reference Scraping → Generated Article → Backend
```

Display

```
Backend API → React Frontend → Browser
```

More details are available in `docs/architecture.md`.

---

## Project Structure

```
beyondchats/
├── backend/            # Express API + SQLite
├── automation/         # Article scraping script
├── article-generator/  # AI generation logic
├── frontend/           # React + TypeScript UI
├── docs/               # Architecture documentation
└── README.md
```

---

## How to Run the Project

### Requirements

- Node.js (v14+)
- npm

### 1. Start Backend

```bash
cd backend
npm install
npm start
```

Runs on `http://localhost:3000`

---

### 2. Scrape Articles (One Time)

```bash
cd automation
npm install
node src/index.js
```

Scrapes the 5 oldest BeyondChats articles and stores them in the database.

---

### 3. Generate Enhanced Article (Optional)

```bash
cd article-generator
npm install
node index.js
```

Creates an AI-enhanced version of the latest article.

---

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Design Decisions

- SQLite – Simple and lightweight for a demo project
- Mocked LLM – Avoids paid APIs while keeping structure production-ready
- No Authentication – Keeps focus on core functionality
- Single-component frontend – Avoids unnecessary complexity
- API-only communication – Clean separation between scripts and database

---

## What This Project Demonstrates

- Full-stack development skills
- REST API design
- Web scraping and data extraction
- External data integration
- Frontend development with React
- Clean system architecture
- Clear documentation

---

## Known Limitations

- Google scraping may fail due to blocking
- LLM generation is mocked
- No automated tests
- Local development only

These were intentional trade-offs to keep the project focused and readable.

---

## API Reference

### GET `/api/articles`

Returns all articles (newest first)

### GET `/api/articles/:id`

Returns a single article

### POST `/api/articles`

Creates a new article


## Troubleshooting

- Backend not starting → Check port 3000
- No articles → Run the scraping script
- Frontend errors → Ensure backend is running
- Generator fails → Ensure at least one article exists

---

## License

ISC