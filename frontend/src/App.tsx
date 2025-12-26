import { useState, useEffect } from 'react'
import './App.css'

interface Article {
  id: string
  title: string
  content: string
  source_url: string | null
  source_type: string | null
  is_generated: number
  parent_article_id: string | null
  references: string[] | null
  created_at: string
  updated_at: string
}

const API_BASE_URL = 'http://localhost:3000/api'

function App() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/articles`)
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      const data = await response.json()
      setArticles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getParentArticle = (parentId: string | null) => {
    if (!parentId) return null
    return articles.find(a => a.id === parentId)
  }

  const getGeneratedVersions = (articleId: string) => {
    return articles.filter(a => a.parent_article_id === articleId)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading articles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchArticles}>Retry</button>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="app">
        <div className="empty">
          <h2>No Articles Found</h2>
          <p>There are no articles in the system yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>BeyondChats Articles</h1>
        <p className="subtitle">Displaying {articles.length} articles</p>
      </header>

      <div className="content">
        <div className="article-list">
          {articles.map((article) => (
            <div
              key={article.id}
              className={`article-card ${article.is_generated ? 'generated' : 'original'} ${
                selectedArticle?.id === article.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedArticle(article)}
            >
              <div className="article-badge">
                {article.is_generated ? '🤖 Generated' : '📝 Original'}
              </div>
              <h3 className="article-title">{article.title}</h3>
              <p className="article-preview">
                {truncateText(article.content.replace(/[#*\n]/g, ' '), 150)}
              </p>
              <div className="article-meta">
                <span className="source-type">{article.source_type || 'unknown'}</span>
                {article.is_generated && article.parent_article_id && (
                  <span className="link-indicator">↳ Based on original</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedArticle && (
          <div className="article-detail">
            <div className="detail-header">
              <div className="badge-large">
                {selectedArticle.is_generated ? '🤖 AI Generated Article' : '📝 Original Article'}
              </div>
              <button className="close-btn" onClick={() => setSelectedArticle(null)}>
                ✕
              </button>
            </div>

            <h1>{selectedArticle.title}</h1>

            {selectedArticle.is_generated && selectedArticle.parent_article_id && (
              <div className="parent-link">
                <strong>Based on:</strong>{' '}
                {getParentArticle(selectedArticle.parent_article_id)?.title || 'Original article'}
              </div>
            )}

            {!selectedArticle.is_generated && getGeneratedVersions(selectedArticle.id).length > 0 && (
              <div className="generated-versions">
                <strong>Generated versions:</strong>{' '}
                {getGeneratedVersions(selectedArticle.id).length} version(s) exist
              </div>
            )}

            <div className="detail-meta">
              <div className="meta-item">
                <strong>Type:</strong> {selectedArticle.source_type || 'unknown'}
              </div>
              <div className="meta-item">
                <strong>Created:</strong> {new Date(selectedArticle.created_at).toLocaleDateString()}
              </div>
              {selectedArticle.source_url && (
                <div className="meta-item">
                  <strong>Source:</strong>{' '}
                  <a href={selectedArticle.source_url} target="_blank" rel="noopener noreferrer">
                    View Original
                  </a>
                </div>
              )}
            </div>

            <div className="content-body">
              {selectedArticle.content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {selectedArticle.references && selectedArticle.references.length > 0 && (
              <div className="references">
                <h3>References</h3>
                <ul>
                  {selectedArticle.references.map((ref, idx) => (
                    <li key={idx}>
                      <a href={ref} target="_blank" rel="noopener noreferrer">
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
