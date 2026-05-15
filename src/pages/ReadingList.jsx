import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import '../styles/readinglist.css';

// Helper to get public URL for cover images
function getPublicImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('inkwell').getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export default function ReadingList() {
  const { user } = useAuth();
  const [savedStories, setSavedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from('user_saves')
        .select('story_id, stories(id, title, author, genre, cover_color, cover_image_url)')
        .eq('user_id', user.id);
      if (!error && data) {
        const enriched = data.map(item => {
          const story = item.stories;
          const coverUrl = getPublicImageUrl(story.cover_image_url);
          return { ...story, cover_url: coverUrl };
        });
        setSavedStories(enriched);
      }
      setLoading(false);
    };
    fetchSaved();
  }, [user]);

  if (!user) {
    return (
      <div className="reading-list-container">
        <div className="reading-list-message">
          <h2>📖 My Reading List</h2>
          <p>Please sign in to view your saved stories.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="reading-list-container"><div className="loading-spinner">Loading your library...</div></div>;

  return (
    <div className="reading-list-container">
      <h2 className="reading-list-title">📖 My Reading List</h2>
      {savedStories.length === 0 ? (
        <div className="reading-list-empty">
          <p>You haven't saved any stories yet.</p>
          <p>Tap the ♡ button on any story to add it here.</p>
        </div>
      ) : (
        <div className="reading-list-grid">
          {savedStories.map(story => (
            <Link to={`/story/${story.id}`} key={story.id} className="reading-list-card">
              <div 
                className="reading-list-cover" 
                style={{ 
                  background: story.cover_url 
                    ? `url(${story.cover_url}) center/cover no-repeat` 
                    : story.cover_color || '#2D2D3A'
                }}
              />
              <div className="reading-list-info">
                <h3 className="reading-list-story-title">{story.title}</h3>
                <p className="reading-list-author">by {story.author}</p>
                <span className="reading-list-genre">{story.genre}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}