import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function LouisesCorner() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [drawingUrl, setDrawingUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Allow both emails (case‑insensitive)
  const allowedEmails = ['sarahpuadaaddao22@gmail.com', 'noctirionvale@gmail.com'];
  const isLouise = user?.email && allowedEmails.includes(user.email.toLowerCase());

  useEffect(() => {
    const fetchStories = async () => {
      const { data, error } = await supabase
        .from('louise_stories')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (!error) setStories(data || []);
      setLoading(false);
    };
    fetchStories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLouise) {
      setMessage('Only Louise can submit stories here.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('louise_stories')
      .insert({
        title,
        content,
        drawing_url: drawingUrl || null,
        author_name: 'Louise',
        status: 'pending'
      });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('✨ Story sent for review! It will appear after approval. ✨');
      setTitle('');
      setContent('');
      setDrawingUrl('');
      setShowForm(false);
    }
    setSubmitting(false);
  };

  return (
    <div id="louises-corner" className="louises-corner">
      {/* Decorative sparkles */}
      <div className="corner-decoration">
        <div className="sparkle sparkle-1">✦</div>
        <div className="sparkle sparkle-2">✧</div>
        <div className="sparkle sparkle-3">☆</div>
      </div>

      <div className="corner-header">
        <h2>✨ Louise's Creative Corner ✨</h2>
        <p>Stories & drawings by Louise – a little magic for everyone</p>
      </div>

      {isLouise && (
        <div className="corner-actions">
          <button onClick={() => setShowForm(!showForm)} className="btn-submit-story">
            {showForm ? '🧸 Close' : '✏️ Share a new story + drawing'}
          </button>
        </div>
      )}

      {showForm && isLouise && (
        <form onSubmit={handleSubmit} className="story-form">
          <input
            type="text"
            placeholder="What's the title of your story?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your magical tale here..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="Link to your drawing (optional) – e.g., from Imgur or Google Drive"
            value={drawingUrl}
            onChange={(e) => setDrawingUrl(e.target.value)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : '🌟 Publish my story 🌟'}
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
      )}

      <div className="stories-list">
        {loading ? (
          <p className="loading-message">✨ Loading magical stories... ✨</p>
        ) : stories.length === 0 ? (
          <p className="no-stories">🌸 No stories yet. Louise will add some soon! 🌸</p>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="story-card">
              <h3>{story.title}</h3>
              <div className="story-meta">
                🧚 by {story.author_name} · {new Date(story.created_at).toLocaleDateString()}
              </div>
              {story.drawing_url && (
                <div className="story-drawing">
                  <img src={story.drawing_url} alt="Drawing for this story" loading="lazy" />
                </div>
              )}
              <div className="story-content">{story.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}