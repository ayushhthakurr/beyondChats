# System Architecture

## Overview

The BeyondChats Article System follows a three-tier architecture with clear separation between data collection, processing, and presentation layers.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    External Sources                         │
│                                                             │
│  • BeyondChats Blog (https://beyondchats.com/blogs)       │
│  • Google Search Results                                   │
│  • Referenced Blog Articles                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐       │
│  │  Automation  │  │    Article    │  │  Frontend   │       │
│  │   Scraper    │  │   Generator   │  │   (React)   │       │
│  └──────┬───────┘  └───────┬───────┘  └──────┬──────┘       │
│         │                   │                  │            │
│         │ POST              │ GET/POST         │ GET        │
└─────────┼───────────────────┼──────────────────┼────────────┘ 
          │                   │                  │
          ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Layer                        │
│                                                             │
│      Express.js REST API (Port 3000)                        │
│                                                             │
│   Routes → Controllers → Models → Database                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│                                                             │
│              SQLite Database (articles.db)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Phase 1: Article Scraping

```
┌──────────────┐
│ BeyondChats  │
│     Blog     │
└──────┬───────┘
       │ 1. HTTP GET
       ▼
┌──────────────┐
│   Cheerio    │ 2. Parse HTML
│   Parser     │    Extract data
└──────┬───────┘
       │ 3. Article objects
       ▼
┌──────────────┐
│   Rewrite    │ 4. POST /api/articles
│   Module     │    (for each article)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Backend API  │ 5. Validate & create
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Database   │ 6. INSERT INTO articles
└──────────────┘
```

### Phase 2: Article Generation

```
┌──────────────┐
│ Backend API  │ 1. GET /api/articles
└──────┬───────┘    (latest article)
       │
       ▼
┌──────────────┐
│    Google    │ 2. Search by title
│    Search    │
└──────┬───────┘
       │ 3. Extract URLs
       ▼
┌──────────────┐
│   Scrape 2   │ 4. Fetch content
│   External   │    Parse HTML
│   Articles   │
└──────┬───────┘
       │ 5. Reference data
       ▼
┌──────────────┐
│   Generate   │ 6. Combine original
│   Content    │    + references
│   (Mocked)   │    + citations
└──────┬───────┘
       │ 7. Generated article
       ▼
┌──────────────┐
│ Backend API  │ 8. POST /api/articles
└──────┬───────┘    with metadata
       │
       ▼
┌──────────────┐
│   Database   │ 9. INSERT with links
└──────────────┘
```

### Phase 3: Frontend Display

```
┌──────────────┐
│    React     │ 1. Component mount
│  Component   │
└──────┬───────┘
       │ 2. useEffect()
       ▼
┌──────────────┐
│ Backend API  │ 3. GET /api/articles
└──────┬───────┘
       │ 4. JSON array
       ▼
┌──────────────┐
│  State       │ 5. setArticles(data)
│  Update      │
└──────┬───────┘
       │ 6. Re-render
       ▼
┌──────────────┐
│   Browser    │ 7. Display UI
│     DOM      │
└──────────────┘
```

---

## Database Schema

### Articles Table

```sql
CREATE TABLE articles (
  id                 TEXT PRIMARY KEY,      -- UUID
  title              TEXT NOT NULL,         -- Article title
  content            TEXT NOT NULL,         -- Full article text
  source_url         TEXT,                  -- Original URL (if scraped)
  source_type        TEXT,                  -- 'beyondchats' | 'generated' | etc
  is_generated       INTEGER DEFAULT 0,     -- 0 = original, 1 = generated
  parent_article_id  TEXT,                  -- Links to original (if generated)
  references         TEXT,                  -- JSON array of reference URLs
  created_at         TEXT NOT NULL,         -- ISO timestamp
  updated_at         TEXT NOT NULL          -- ISO timestamp
);
```

### Data Relationships

```
Original Article (is_generated = 0)
    │
    ├─ parent_article_id: null
    ├─ references: null
    └─ source_url: "https://beyondchats.com/blogs/..."

          ↓ (generates)

Generated Article (is_generated = 1)
    │
    ├─ parent_article_id: <original_id>
    ├─ references: ["url1", "url2"]
    └─ source_url: null
```

---

## API Layer Architecture

### Backend Structure

```
backend/src/
│
├── server.js              # Express app setup, CORS, middleware
│
├── routes/
│   └── articles.js        # Route definitions (GET/POST endpoints)
│
├── controllers/
│   └── articleController.js   # Business logic & request handling
│
├── models/
│   └── articleModel.js        # Database queries (CRUD operations)
│
└── db/
    └── database.js            # SQLite connection & table creation
```

### Request Flow

```
HTTP Request
    ↓
Express Router (routes/articles.js)
    ↓
Controller (articleController.js)
    ↓
Model (articleModel.js)
    ↓
Database (SQLite via better-sqlite3)
    ↓
Response (JSON)
```

---

## Frontend Architecture

### Component Structure

```
App.tsx (Main Component)
│
├── State
│   ├── articles: Article[]
│   ├── loading: boolean
│   ├── error: string | null
│   └── selectedArticle: Article | null
│
├── Effects
│   └── useEffect() → fetchArticles()
│
└── Render
    ├── Header
    ├── Article List
    │   └── Article Cards
    └── Article Detail (conditional)
        ├── Title & Metadata
        ├── Content
        └── References (if generated)
```

### Data Flow

```
Component Mount
    ↓
fetch('http://localhost:3000/api/articles')
    ↓
Parse JSON Response
    ↓
Update State (setArticles)
    ↓
Re-render with Data
    ↓
User Clicks Article
    ↓
Update State (setSelectedArticle)
    ↓
Re-render Detail View
```

---

## Technology Stack

### Backend
- **Runtime:** Node.js v20+
- **Framework:** Express.js
- **Database:** SQLite with better-sqlite3
- **HTTP:** Built-in http module with CORS

### Automation
- **HTTP Client:** Axios with custom agents
- **HTML Parser:** Cheerio
- **Execution:** One-time CLI script

### Article Generator
- **HTTP Client:** Axios
- **HTML Parser:** Cheerio
- **Generation:** Mocked (structure ready for LLM)

### Frontend
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Pure CSS (no libraries)

---

## Security Considerations

### Current Implementation (Development)

- ✅ CORS enabled for local development
- ✅ No sensitive data in responses
- ✅ SQLite prevents SQL injection (prepared statements)
- ❌ No authentication (not required for assignment)
- ❌ No rate limiting
- ❌ No input sanitization beyond basic validation

### Production Recommendations

If deploying to production:
- Add authentication (JWT or session-based)
- Implement rate limiting
- Sanitize all user inputs
- Use PostgreSQL instead of SQLite
- Add HTTPS
- Implement proper error logging
- Add request validation middleware

---

## Scalability Notes

### Current Limitations

- **SQLite** - Single file, no concurrent writes
- **No Caching** - Every request hits database
- **No Queue** - Synchronous scraping/generation
- **No CDN** - Static assets served from Vite dev server

### Scaling Path

For production scale:
1. **Database:** Migrate to PostgreSQL
2. **Caching:** Add Redis for frequent queries
3. **Queue:** Use Bull/BullMQ for background jobs
4. **API:** Add GraphQL for flexible queries
5. **Frontend:** Deploy to CDN (Vercel/Netlify)
6. **Backend:** Containerize with Docker

---

## Error Handling

### Backend
- Validation errors → 400 Bad Request
- Not found → 404 Not Found
- Server errors → 500 Internal Server Error
- All errors logged to console

### Scraper
- Network errors → Retry with fallback
- Parse errors → Skip article, continue
- API errors → Log and exit with code 1

### Generator
- Google blocking → Use fallback URLs
- Scrape failures → Handle gracefully, continue
- API errors → Log and exit with code 1

### Frontend
- Fetch errors → Display error message with retry
- No data → Display empty state
- Loading → Show loading indicator

---

## Development Workflow

### Local Development

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Scripts (as needed)
cd automation && node src/index.js
cd article-generator && node index.js
```

### File Watching

- **Backend:** No auto-reload (restart manually)
- **Frontend:** Vite HMR (hot module replacement)
- **Scripts:** Run manually

---

## Future Enhancements

Potential improvements (not implemented):

- **Search Functionality** - Search articles by keyword
- **Filtering** - Filter by type, date, source
- **Pagination** - Handle large article counts
- **Article Editing** - Update existing articles
- **Scheduled Generation** - Cron job for automatic generation
- **Real LLM Integration** - OpenAI/Anthropic APIs
- **Better Scraping** - Puppeteer for JS-rendered sites
- **Export** - Download articles as PDF/markdown
- **Analytics** - Track article views and engagement

---

This architecture prioritizes clarity and simplicity over premature optimization, making it easy to understand, maintain, and extend as needed.

