# BeyondChats Backend

Simple Node.js + Express + SQLite backend for article management.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### POST /api/articles
Create a new article

**Request Body:**
```json
{
  "title": "Sample Article",
  "content": "This is the article content",
  "source_url": "https://example.com/article",
  "source_type": "web",
  "is_generated": false,
  "parent_article_id": null,
  "references": ["ref1", "ref2"]
}
```

### GET /api/articles
Get all articles

### GET /api/articles/:id
Get a single article by ID

## Testing

### Using curl

**Create Article:**
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "content": "This is a test article",
    "source_url": "https://example.com",
    "source_type": "web"
  }'
```

**Get All Articles:**
```bash
curl http://localhost:3000/api/articles
```

**Get Single Article:**
```bash
curl http://localhost:3000/api/articles/{article-id}
```

### Using Postman

1. **Create Article**
   - Method: POST
   - URL: `http://localhost:3000/api/articles`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "title": "Sample Article",
     "content": "Article content here"
   }
   ```

2. **Get All Articles**
   - Method: GET
   - URL: `http://localhost:3000/api/articles`

3. **Get Article By ID**
   - Method: GET
   - URL: `http://localhost:3000/api/articles/{article-id}`

## Database

SQLite database file: `backend/articles.db`
- Auto-created on first run
- No migrations needed

