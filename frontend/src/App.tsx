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
  const [activeTab, setActiveTab] = useState<'original' | 'generated'>('original')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setRefreshing(true)
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
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setSelectedArticle(null)
    fetchArticles()
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

  // Separate original and generated articles
  const originalArticles = articles.filter(a => !a.is_generated)
  const generatedArticles = articles.filter(a => a.is_generated)

  // Get the articles to display based on active tab
  const displayedArticles = activeTab === 'original' ? originalArticles : generatedArticles

  if (loading && articles.length === 0) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error && articles.length === 0) {
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
          <p className="empty-hint">Run the automation script to scrape and generate articles.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>BeyondChats Articles</h1>
            <p className="subtitle">
              {originalArticles.length} original · {generatedArticles.length} AI-generated
            </p>
          </div>
          <button
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <span className="refresh-icon">↻</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="content">
        <div className="sidebar">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'original' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('original')
                setSelectedArticle(null)
              }}
            >
              <span className="tab-label">Original Articles</span>
              <span className="tab-count">{originalArticles.length}</span>
            </button>
            <button
              className={`tab ${activeTab === 'generated' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('generated')
                setSelectedArticle(null)
              }}
            >
              <span className="tab-label">AI Generated</span>
              <span className="tab-count">{generatedArticles.length}</span>
            </button>
          </div>

          <div className="article-list">
            {displayedArticles.length === 0 ? (
              <div className="no-articles">
                <p>
                  {activeTab === 'original'
                    ? 'No original articles yet'
                    : 'No generated articles yet'}
                </p>
                <p className="hint">
                  {activeTab === 'original'
                    ? 'Run the scraper to fetch articles'
                    : 'Generate AI versions of original articles'}
                </p>
              </div>
            ) : (
              displayedArticles.map((article) => (
                <div
                  key={article.id}
                  className={`article-card ${article.is_generated ? 'generated' : 'original'} ${
                    selectedArticle?.id === article.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="article-badge">
                    {article.is_generated ? 'AI Generated' : 'Original'}
                  </div>
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-preview">
                    {truncateText(article.content.replace(/[#*\n]/g, ' '), 120)}
                  </p>
                  <div className="article-meta">
                    <span className="source-type">{article.source_type || 'unknown'}</span>
                    <span className="date">
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {article.is_generated && article.parent_article_id && (
                    <div className="parent-indicator">
                      Based on: {getParentArticle(article.parent_article_id)?.title?.substring(0, 40) || 'Original'}...
                    </div>
                  )}
                  {!article.is_generated && getGeneratedVersions(article.id).length > 0 && (
                    <div className="versions-indicator">
                      {getGeneratedVersions(article.id).length} AI version{getGeneratedVersions(article.id).length > 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="main-content">
          {selectedArticle ? (
            <div className="article-detail">
              <div className="detail-header">
                <div className="badge-large">
                  {selectedArticle.is_generated ? 'AI Generated Article' : 'Original Article'}
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
                  <button
                    className="view-parent-btn"
                    onClick={() => {
                      const parent = getParentArticle(selectedArticle.parent_article_id)
                      if (parent) {
                        setSelectedArticle(parent)
                        setActiveTab('original')
                      }
                    }}
                  >
                    View Original →
                  </button>
                </div>
              )}

              {!selectedArticle.is_generated && getGeneratedVersions(selectedArticle.id).length > 0 && (
                <div className="generated-versions">
                  <strong>Generated versions:</strong>{' '}
                  {getGeneratedVersions(selectedArticle.id).length} AI-optimized version(s) available
                  <div className="generated-list">
                    {getGeneratedVersions(selectedArticle.id).map(gen => (
                      <button
                        key={gen.id}
                        className="view-generated-btn"
                        onClick={() => {
                          setSelectedArticle(gen)
                          setActiveTab('generated')
                        }}
                      >
                        {gen.title.substring(0, 50)}...
                      </button>
                    ))}
                  </div>
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
                      View Original Source
                    </a>
                  </div>
                )}
              </div>

              <div className="content-body">
                {selectedArticle.content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {selectedArticle.references && selectedArticle.references.length > 0 && (
                <div className="references">
                  <h3>References</h3>
                  <ul>
                    {selectedArticle.references.map((ref: any, idx: number) => (
                      <li key={idx}>
                        {typeof ref === 'object' ? (
                          <>
                            <strong>{ref.title}</strong>
                            <br />
                            <a href={ref.url} target="_blank" rel="noopener noreferrer">
                              {ref.url}
                            </a>
                          </>
                        ) : (
                          <a href={ref} target="_blank" rel="noopener noreferrer">
                            {ref}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h2>
                  {activeTab === 'original'
                    ? 'Select an original article'
                    : 'Select a generated article'}
                </h2>
                <p>
                  {activeTab === 'original'
                    ? 'Choose an article from the list to view its full content'
                    : 'View AI-optimized versions with competitor analysis'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
