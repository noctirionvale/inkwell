import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import '../styles/profile.css';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setDisplayName(data.display_name || '');
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>Profile Settings</h2>
        <p>You must be signed in to view this page.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (loading) return <div className="profile-container">Loading profile...</div>;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name: displayName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile Settings</h2>
      <form onSubmit={handleUpdateProfile} className="profile-form">
        <div className="form-group">
          <label>Display Name (username)</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your pen name"
          />
        </div>
        <button type="submit" disabled={loading}>Save Profile</button>
        {message && <p className="profile-message">{message}</p>}
      </form>
    </div>
  );
}