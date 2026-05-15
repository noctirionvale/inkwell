import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const FALLBACK_STORIES = [
  { id: 1, title: 'The Last Lighthouse', author: 'Mara Solenne', genre: 'FICTION', excerpt: 'She had kept the light burning for forty years...', cover_color: '#2D4A7A', cover_image_url: null },
  { id: 2, title: 'Inventory of Small Losses', author: 'Ciaran Voss', genre: 'POETRY', excerpt: 'One left glove...', cover_color: '#7A2D3E', cover_image_url: null },
  { id: 3, title: 'Dispatch from the Interior', author: 'Yuki Haramoto', genre: 'FLASH FICTION', excerpt: 'The message arrived three weeks late...', cover_color: '#2D6B4A', cover_image_url: null },
  { id: 4, title: 'What the River Kept', author: 'Desta Amare', genre: 'DRAMA', excerpt: 'My grandmother never spoke about the flood...', cover_color: '#6B4A2D', cover_image_url: null },
  { id: 5, title: 'Sleep Study, Room 4B', author: 'Noel Castañeda', genre: 'THRILLER', excerpt: 'The technician went very still...', cover_color: '#3D2D6B', cover_image_url: null },
]

const SPINE_COLORS = ['#5b5bd6','#e05252','#4da8d4','#e8c84a','#3dbf8a','#d45a9a','#e87c3a','#7c5bd6','#4ab8b8','#c25151']

function getPublicImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('inkwell').getPublicUrl(path)
  return data?.publicUrl ?? null
}

export default function StoryCarousel() {
  const [stories, setStories] = useState(FALLBACK_STORIES)
  const [activeIdx, setActiveIdx] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [fullContent, setFullContent] = useState('')
  const [loadingStory, setLoadingStory] = useState(false)
  const [activeStory, setActiveStory] = useState(null)
  const [ripples, setRipples] = useState([])

  const trackRef = useRef(null)
  const viewportRef = useRef(null)
  const clickerRef = useRef(null)
  const rippleId = useRef(0)

  // Drag/swipe state
  const dragStartX = useRef(0)
  const isDragging = useRef(false)
  const startTransform = useRef(0)

  // Load stories
  useEffect(() => {
    supabase
      .from('stories')
      .select('id, title, author, genre, excerpt, cover_image_url, cover_color')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length) setStories(data)
      })
  }, [])

  // Load completed stories
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      supabase
        .from('reading_progress')
        .select('story_id')
        .eq('user_id', session.user.id)
        .eq('completed', true)
        .then(({ data }) => {
          if (data) setCompleted(new Set(data.map(r => r.story_id)))
        })
    })
  }, [])

  // Center active card
  const scrollToActive = useCallback((instant = false) => {
    if (!trackRef.current || !viewportRef.current) return
    const track = trackRef.current
    const viewport = viewportRef.current
    const activeEl = track.children[activeIdx]
    if (!activeEl) return
    if (instant) track.style.transition = 'none'
    else track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    const vpW = viewport.offsetWidth
    const cardL = activeEl.offsetLeft
    const cardW = activeEl.offsetWidth
    const offset = cardL - vpW / 2 + cardW / 2
    const maxShift = track.scrollWidth - vpW
    const shift = Math.max(0, Math.min(offset, maxShift))
    track.style.transform = `translateX(-${shift}px)`
    startTransform.current = shift
  }, [activeIdx])

  useEffect(() => { if (stories.length) scrollToActive(true) }, [stories, scrollToActive])
  useEffect(() => { scrollToActive() }, [activeIdx, scrollToActive])
  useEffect(() => {
    const handleResize = () => scrollToActive(true)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [scrollToActive])

  // ─── Clicker: sequential (next story) ─────────────────────
  const handleClicker = useCallback((e) => {
    if (clickerRef.current) {
      const rect = clickerRef.current.getBoundingClientRect()
      const id = ++rippleId.current
      setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 600)
    }

    // Just move to next story, wrap around
    const nextIdx = (activeIdx + 1) % stories.length
    setActiveIdx(nextIdx)
  }, [activeIdx, stories.length])

  // ─── Swipe handlers (mouse + touch) ────────────────────────
  const handleDragStart = useCallback((e) => {
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
    dragStartX.current = clientX
    isDragging.current = true
    if (trackRef.current) trackRef.current.style.transition = 'none'
  }, [])

  const handleDragMove = useCallback((e) => {
    if (!isDragging.current || !dragStartX.current) return
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    const delta = clientX - dragStartX.current
    const newTransform = startTransform.current - delta
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${Math.max(0, newTransform)}px)`
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const currentTransform = trackRef.current ? parseFloat(trackRef.current.style.transform.match(/-?[\d.]+/)?.[0] || 0) : 0
    const delta = startTransform.current - currentTransform
    const threshold = 80  // less sensitive
    if (Math.abs(delta) > threshold) {
      if (delta < -threshold) {
        // swipe left → next
        const next = (activeIdx + 1) % stories.length
        setActiveIdx(next)
      } else if (delta > threshold) {
        // swipe right → previous
        const prev = (activeIdx - 1 + stories.length) % stories.length
        setActiveIdx(prev)
      }
    }
    scrollToActive()
  }, [activeIdx, stories.length, scrollToActive])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.addEventListener('mousedown', handleDragStart)
    viewport.addEventListener('touchstart', handleDragStart, { passive: false })
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchmove', handleDragMove, { passive: false })
    window.addEventListener('touchend', handleDragEnd)
    return () => {
      viewport.removeEventListener('mousedown', handleDragStart)
      viewport.removeEventListener('touchstart', handleDragStart)
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [handleDragStart, handleDragMove, handleDragEnd])

  // ─── Open story modal ──────────────────────────────────────
  const handleReadStory = useCallback(async (story, e) => {
    e?.stopPropagation()
    setLoadingStory(true)
    setActiveStory(story)
    setFullContent('')
    setShowModal(true)
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('content')
        .eq('id', story.id)
        .single()
      if (error) throw error
      setFullContent(data?.content || '')
    } catch (err) {
      console.error(err)
      setFullContent('')
    } finally {
      setLoadingStory(false)
    }
  }, [])

  const handleCardClick = useCallback((story, idx) => {
    if (idx !== activeIdx) setActiveIdx(idx)
    handleReadStory(story)
  }, [activeIdx, handleReadStory])

  const paragraphs = fullContent ? fullContent.split(/\n\n+/).filter(p => p.trim()) : []

  if (!stories.length) return <div className="carousel-loading">Loading stories...</div>

  return (
    <>
      <div className="carousel-section">
        <div
          className="carousel-viewport"
          ref={viewportRef}
          style={{ touchAction: 'pan-y', cursor: 'grab' }}
        >
          <div className="carousel-track" ref={trackRef}>
            {stories.map((story, idx) => {
              const isActive = idx === activeIdx
              const isDone = completed.has(story.id)
              const bgColor = story.cover_color || SPINE_COLORS[idx % SPINE_COLORS.length]
              const coverUrl = getPublicImageUrl(story.cover_image_url)

              return (
                <div
                  key={story.id}
                  className={`c-card${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
                  onClick={() => handleCardClick(story, idx)}
                  title={story.title}
                >
                  <div className="c-card-inner">
                    <div className="c-card-bg" style={{ background: bgColor }} />
                    {coverUrl && <div className="c-card-bg-image" style={{ backgroundImage: `url(${coverUrl})` }} />}
                    <div className="c-card-overlay" />
                    {isDone && <span className="c-card-done-badge">✓</span>}
                    {!isActive && (
                      <div className="c-card-inactive-title">
                        <span className="c-card-inactive-title-text">{story.title}</span>
                      </div>
                    )}
                    <div className="c-card-body">
                      <div className="c-card-genre">{story.genre}</div>
                      <div className="c-card-title">{story.title}</div>
                      <div className="c-card-author">by {story.author}</div>
                      <div className="c-card-read-hint">tap to read →</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="carousel-dots">
          {stories.map((s, i) => (
            <button
              key={i}
              className={`cdot${i === activeIdx ? ' active' : ''}${completed.has(s.id) ? ' done' : ''}`}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
      </div>

      <div className="sc-controls">
        <button className="sc-ctrl-btn" onClick={() => window.location.href = '/library'}>Browse the Library</button>
        <div className="sc-clicker-wrap">
          <button ref={clickerRef} className="sc-clicker" onClick={handleClicker}>
            {ripples.map(r => <span key={r.id} className="sc-ripple" style={{ left: r.x, top: r.y }} />)}
            <span className="sc-clicker-label">CLICKER</span>
            <span className="sc-clicker-arrow">▶</span>
          </button>
        </div>
        <button className="sc-ctrl-btn" onClick={() => document.getElementById('mood-section')?.scrollIntoView({ behavior: 'smooth' })}>
          Find by Mood
        </button>
      </div>

      {showModal && (
        <div className="story-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="story-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            <div className="story-modal-content">
              {loadingStory ? (
                <div className="modal-loading">Opening the page...</div>
              ) : (
                <>
                  <h2 className="modal-title">{activeStory?.title}</h2>
                  <p className="modal-author">by {activeStory?.author} · {activeStory?.genre}</p>
                  <div className="modal-story-body">
                    {paragraphs.length > 0
                      ? paragraphs.map((para, i) => <p key={i}>{para}</p>)
                      : <p className="modal-loading">No content yet.</p>
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}