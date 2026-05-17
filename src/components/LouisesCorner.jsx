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
  const [drawingFile, setDrawingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const isLouise = user?.email === 'sarahpuadaaddao22@gmail.com' || user?.email === 'noctirionvale@gmail.com';

  const fetchStories = async () => {
    const { data } = await supabase
      .from('louise_stories')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (data) setStories(data);
    setLoading(false);
  };

  useEffect(() => { fetchStories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLouise) return;
    setSubmitting(true);
    let uploadedUrl = null;
    if (drawingFile) {
      const fileExt = drawingFile.name.split('.').pop();
      const fileName = `louise_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('inkwell')
        .upload(`drawings/${fileName}`, drawingFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from('inkwell').getPublicUrl(`drawings/${fileName}`);
        uploadedUrl = urlData.publicUrl;
      }
    }
    const storyData = { title, content, drawing_url: uploadedUrl, author_name: 'Louise', status: 'published' };
    if (editingId) {
      await supabase.from('louise_stories').update(storyData).eq('id', editingId);
      setMessage('Story updated!');
    } else {
      await supabase.from('louise_stories').insert(storyData);
      setMessage('✨ Story published! ✨');
    }
    setTitle('');
    setContent('');
    setDrawingFile(null);
    setShowForm(false);
    setEditingId(null);
    fetchStories();
    setSubmitting(false);
  };

  const handleEdit = (story) => {
    setEditingId(story.id);
    setTitle(story.title);
    setContent(story.content);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this story?')) {
      await supabase.from('louise_stories').delete().eq('id', id);
      fetchStories();
    }
  };

  const handleShare = (story) => {
    const url = `${window.location.origin}/?story=${story.id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied!');
  };

  if (!isLouise && stories.length === 0) return null;

  return (
    <div id="louises-corner" className="louises-corner">
      <div className="corner-header">
        <h2>✨ Louise's Creative Corner ✨</h2>
        <p>Stories & drawings by Louise – a little magic for everyone</p>
      </div>
      {isLouise && (
        <div className="corner-actions">
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(''); setContent(''); }} className="btn-submit-story">
            {showForm ? '🧸 Close' : '✏️ Share a new story + drawing'}
          </button>
        </div>
      )}
      {showForm && isLouise && (
        <form onSubmit={handleSubmit} className="story-form">
          <input type="text" placeholder="Story title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea placeholder="Write your magical tale..." rows={6} value={content} onChange={e => setContent(e.target.value)} required />
          <input type="file" accept="image/*" onChange={e => setDrawingFile(e.target.files[0])} />
          <button type="submit" disabled={submitting}>{editingId ? '✏️ Update' : '🌟 Publish'}</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      )}
      <div className="stories-list">
        {loading ? <p>Loading...</p> : stories.map(story => (
          <div key={story.id} className="story-card">
            <h3>{story.title}</h3>
            <div className="story-meta">by {story.author_name} · {new Date(story.created_at).toLocaleDateString()}</div>
            {story.drawing_url && <div className="story-drawing"><img src={story.drawing_url} alt="Drawing" /></div>}
            <div className="story-content">{story.content}</div>
            {isLouise && (
              <div className="story-actions">
                <button onClick={() => handleEdit(story)}>✏️ Edit</button>
                <button onClick={() => handleDelete(story.id)}>🗑️ Delete</button>
                <button onClick={() => handleShare(story)}>🔗 Share</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}