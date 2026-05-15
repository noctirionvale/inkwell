import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../hooks/useLang'
import '../styles/submit.css'

const GENRES = ['Fiction', 'Flash Fiction', 'Poetry', 'Drama', 'Thriller', 'Horror', 'Romance', 'Sci-Fi', 'Historical', 'Fantasy', 'Mystery', 'Surreal']

export default function StorySubmitForm({ onClose }) {
  const { user } = useAuth()
  const { t, LABELS } = useLang()
  const [step, setStep] = useState(1) // 1: form, 2: success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    pen_name: '',
    email: user?.email || '',
    title: '',
    genre: '',
    language: 'en',
    excerpt: '',
    content: '',
    author_note: '',
  })

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (form.content.trim().length < 200) {
      setError('Story content must be at least 200 characters.')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await supabase.from('story_submissions').insert({
        ...form,
        user_id: user?.id || null,
      })
      if (err) throw err
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) return (
    <div className="submit-overlay" onClick={onClose}>
      <div className="submit-modal submit-success" onClick={e => e.stopPropagation()}>
        <div className="submit-success-icon">✦</div>
        <h2>Your story has been received.</h2>
        <p>We read every submission carefully. If your story is selected, we'll reach out to <strong>{form.email}</strong>.</p>
        <p className="submit-tagline">Thank you for adding to the library.</p>
        <button className="submit-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )

  return (
    <div className="submit-overlay" onClick={onClose}>
      <div className="submit-modal" onClick={e => e.stopPropagation()}>
        <button className="submit-x" onClick={onClose}>×</button>
        <div className="submit-header">
          <h2 className="submit-title">{t.submit_story}</h2>
          <p className="submit-sub">We curate carefully. Write honestly.</p>
        </div>

        <form className="submit-form" onSubmit={handleSubmit}>
          <div className="submit-row">
            <div className="submit-field">
              <label>Pen Name *</label>
              <input value={form.pen_name} onChange={e => update('pen_name', e.target.value)} required placeholder="How you want to be credited" />
            </div>
            <div className="submit-field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="For editorial correspondence" />
            </div>
          </div>

          <div className="submit-row">
            <div className="submit-field">
              <label>Story Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} required placeholder="Your title" />
            </div>
            <div className="submit-field">
              <label>Genre *</label>
              <select value={form.genre} onChange={e => update('genre', e.target.value)} required>
                <option value="">Select genre</option>
                {GENRES.map(g => <option key={g} value={g.toUpperCase()}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="submit-field">
            <label>Language *</label>
            <div className="submit-lang-options">
              {Object.values(LABELS).map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={`submit-lang-btn${form.language === l.code ? ' active' : ''}`}
                  onClick={() => update('language', l.code)}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="submit-field">
            <label>Excerpt * <span className="submit-hint">(1–3 sentences, shown on the card)</span></label>
            <textarea
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              required
              rows={3}
              maxLength={300}
              placeholder="The hook. What pulls a reader in."
            />
            <span className="submit-count">{form.excerpt.length}/300</span>
          </div>

          <div className="submit-field">
            <label>Full Story * <span className="submit-hint">(min 200 characters)</span></label>
            <textarea
              value={form.content}
              onChange={e => update('content', e.target.value)}
              required
              rows={12}
              placeholder="Your story. Use double line breaks between paragraphs."
            />
            <span className="submit-count">{form.content.length} chars</span>
          </div>

          <div className="submit-field">
            <label>Author Note <span className="submit-hint">(optional — what inspired this?)</span></label>
            <textarea
              value={form.author_note}
              onChange={e => update('author_note', e.target.value)}
              rows={3}
              placeholder="A note to our editors (not published)"
            />
          </div>

          {error && <p className="submit-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit to Inkwell →'}
          </button>
        </form>
      </div>
    </div>
  )
}