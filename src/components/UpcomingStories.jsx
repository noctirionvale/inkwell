import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../hooks/useLang'
import '../styles/upcoming.css'

export default function UpcomingStories() {
  const { t } = useLang()
  const [stories, setStories] = useState([])

  useEffect(() => {
    supabase
      .from('stories')
      .select('id, title, author, genre, excerpt, cover_color, coming_soon_date, language')
      .eq('coming_soon', true)
      .eq('published', false)
      .order('coming_soon_date', { ascending: true })
      .then(({ data }) => { if (data) setStories(data) })
  }, [])

  if (!stories.length) return null

  function daysUntil(dateStr) {
    const diff = new Date(dateStr) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <section className="upcoming-section">
      <div className="upcoming-header">
        <p className="upcoming-label">{t.upcoming}</p>
        <div className="upcoming-line" />
      </div>
      <div className="upcoming-grid">
        {stories.map(story => {
          const days = story.coming_soon_date ? daysUntil(story.coming_soon_date) : null
          return (
            <div
              key={story.id}
              className="upcoming-card"
              style={{ '--card-color': story.cover_color || '#2D2D3A' }}
            >
              <div className="upcoming-card-bg" />
              <div className="upcoming-card-content">
                <div className="upcoming-top">
                  <span className="upcoming-genre">{story.genre}</span>
                  {story.language !== 'en' && (
                    <span className="upcoming-lang-badge">
                      {story.language === 'fil' ? '🇵🇭' : story.language === 'zh' ? '🇨🇳' : story.language}
                    </span>
                  )}
                </div>
                <h3 className="upcoming-title">{story.title}</h3>
                <p className="upcoming-author">by {story.author}</p>
                <p className="upcoming-excerpt">"{story.excerpt}"</p>
                <div className="upcoming-footer">
                  <span className="upcoming-lock">🔒</span>
                  {days !== null && (
                    <span className="upcoming-days">
                      {days === 0 ? 'Today' : `${days}d`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}