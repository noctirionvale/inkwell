import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import '../styles/continue-reading.css';

function getPublicImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('inkwell').getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export default function ContinueReading() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // First try reading progress (unfinished stories)
      const { data: progressData, error: progressError } = await supabase
        .from('reading_progress')
        .select(`
          story_id,
          paragraph_index,
          stories!inner (
            id,
            title,
            author,
            cover_color,
            cover_image_url,
            content
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('last_read_at', { ascending: false });

      if (!progressError && progressData && progressData.length > 0) {
        const enriched = progressData.map(item => {
          const story = item.stories;
          const totalParas = (story.content || '').split(/\n\n+/).filter(p => p.trim()).length || 1;
          let progress = Math.min(100, Math.round((item.paragraph_index / totalParas) * 100));
          // Ensure progress is at least 1 if paragraph_index > 0
          if (item.paragraph_index > 0 && progress === 0) progress = 1;
          const coverUrl = getPublicImageUrl(story.cover_image_url);
          return {
            id: story.id,
            title: story.title,
            author: story.author,
            cover_color: story.cover_color,
            cover_url: coverUrl,
            progress
          };
        });
        setItems(enriched);
        setLoading(false);
        return;
      }

      // Fallback: saved stories (reading list)
      const { data: savedData, error: savedError } = await supabase
        .from('user_saves')
        .select('stories!inner (id, title, author, cover_color, cover_image_url)')
        .eq('user_id', user.id)
        .limit(6);

      if (!savedError && savedData && savedData.length > 0) {
        const fallback = savedData.map(item => {
          const story = item.stories;
          const coverUrl = getPublicImageUrl(story.cover_image_url);
          return {
            id: story.id,
            title: story.title,
            author: story.author,
            cover_color: story.cover_color,
            cover_url: coverUrl,
            progress: 0
          };
        });
        setItems(fallback);
      } else {
        setItems([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) return null;
  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="continue-reading-section">
      <div className="continue-reading-header">
        <h2 className="continue-reading-title">📖 Continue Reading</h2>
        <span className="continue-reading-sub">Pick up where you left off</span>
      </div>
      <div className="continue-reading-track">
        {items.map(story => (
          <Link to={`/story/${story.id}`} key={story.id} className="continue-reading-card">
            <div
              className="continue-reading-cover"
              style={{
                background: story.cover_url
                  ? `url(${story.cover_url}) center/cover no-repeat`
                  : story.cover_color || '#2D2D3A'
              }}
            />
            <div className="continue-reading-info">
              <h3 className="continue-reading-story-title">{story.title}</h3>
              <p className="continue-reading-author">by {story.author}</p>
              {story.progress > 0 ? (
                <>
                  <div className="continue-progress-bar">
                    <div className="continue-progress-fill" style={{ width: `${story.progress}%` }} />
                  </div>
                  <span className="continue-progress-percent">{story.progress}% read</span>
                </>
              ) : (
                <span className="continue-start-label">Start reading →</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}