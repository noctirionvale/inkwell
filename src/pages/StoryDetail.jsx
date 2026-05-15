import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/story-detail.css';

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('title, author, genre, content, cover_color')
        .eq('id', id)
        .single();
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      setStory(data);
      setContent(data.content || '');
      setLoading(false);
    };
    fetchStory();
  }, [id]);

  if (loading) return <div className="story-detail-container">Loading story...</div>;
  if (!story) return <div className="story-detail-container">Story not found.</div>;

  // Split content into paragraphs
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

  return (
    <div className="story-detail-container">
      <Link to="/" className="story-detail-back">← Back to Library</Link>
      <article className="story-detail-card">
        <h1 className="story-detail-title">{story.title}</h1>
        <p className="story-detail-author">by {story.author} · {story.genre}</p>
        <div className="story-detail-body">
          {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </article>
    </div>
  );
}