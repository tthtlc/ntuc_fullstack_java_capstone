
import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/members/me');
        setProfile(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setUsername(response.data.username);
      } catch (err) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8080/api/members/me', { name, email, username, password });
      alert('Profile updated');
    } catch (err) {
      setError('Update failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Username: {profile.username}</p>
      <form onSubmit={handleUpdate}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ display: 'block', margin: '10px 0' }} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ display: 'block', margin: '10px 0' }} />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={{ display: 'block', margin: '10px 0' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" style={{ display: 'block', margin: '10px 0' }} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ display: 'block' }}>Update</button>
      </form>
    </div>
  );
};

export default Profile;
