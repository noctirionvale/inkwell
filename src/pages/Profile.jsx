import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#f2ead8' }}>
      <h1>Profile Settings</h1>
      {user ? <p>Logged in as: {user.email}</p> : <p>Please sign in</p>}
    </div>
  );
}