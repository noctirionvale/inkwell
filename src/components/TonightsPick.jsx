import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const FALLBACK = {
  id: null,
  title: 'Sleep Study, Room 4B',
  author: 'Noel Castañeda',
  genre: 'THRILLER',
  pull_quote: 'The technician went very still. Then she reached over and quietly unplugged the recording equipment.',
  cover_color: '#3D2D6B',
  cover_image_url: null,
};

export default function TonightsPick() {
  const [story, setStory] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [fullContent, setFullContent] = useState('');
  const [loadingStory, setLoadingStory] = useState(false);

  useEffect(() => {
    async function fetchPick() {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, author, genre, pull_quote, cover_color, cover_image_url')
        .eq('featured', true)
        .eq('published', true)
        .limit(1)
        .single();
      
      if (!error && data) {
        setStory(data);
      } else {
        // fallback to a random story if no featured flag
        const { data: random } = await supabase
          .from('stories')
          .select('id, title, author, genre, pull_quote, cover_color, cover_image_url')
          .eq('published', true)
          .limit(1)
          .single();
        if (random) setStory(random);
      }
      setLoading(false);
    }
    fetchPick();
  }, []);

  // Get full story for modal
  async function handleReadNow() {
    if (!story.id) return;
    try {
      setLoadingStory(true);
      const { data, error } = await supabase
        .from('stories')
        .select('content')
        .eq('id', story.id)
        .single();
      if (error) throw error;
      setFullContent(data?.content || 'No content available.');
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Could not load the full story.');
    } finally {
      setLoadingStory(false);
    }
  }

  // Build cover image URL
  let coverUrl = null;
  if (story.cover_image_url) {
    const { data } = supabase.storage.from('inkwell').getPublicUrl(story.cover_image_url);
    coverUrl = data?.publicUrl;
  }
  const bgColor = story.cover_color || '#2D2D3A';

  if (loading) return <div className="tonights-loading">✨ Curating tonight's pick...</div>;

  return (
    <>
      <section className="tonights-section">
        <div className="tonights-card" onClick={handleReadNow}>
          <div
            className="tonights-cover"
            style={{
              background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : bgColor,
            }}
          >
            <div className="tonights-cover-overlay" />
            <span className="tonights-genre-badge">{story.genre}</span>
          </div>
          <div className="tonights-info">
            <p className="tonights-label">✦ Tonight's Pick ✦</p>
            <h3 className="tonights-title">{story.title}</h3>
            <p className="tonights-author">by {story.author}</p>
            <blockquote className="tonights-quote">“{story.pull_quote}”</blockquote>
            <button className="tonights-read-btn" onClick={(e) => { e.stopPropagation(); handleReadNow(); }}>
              Read in the Dark →
            </button>
          </div>
        </div>
      </section>

      {/* Modal – same dark design as StoryCarousel */}
      {showModal && (
        <div className="story-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="story-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            <div className="story-modal-content">
              {loadingStory ? (
                <div className="modal-loading">Loading story...</div>
              ) : (
                <>
                  <h2 className="modal-title">{story.title}</h2>
                  <p className="modal-author">by {story.author}</p>
                  <div className="modal-story-body">
                    {fullContent.split('\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}