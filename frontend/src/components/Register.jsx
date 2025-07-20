import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', { name, username, email, password });
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);
      if (decoded.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ /* inline CSS */ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ display: 'block', margin: '10px 0' }} />
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ display: 'block', margin: '10px 0' }} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', margin: '10px 0' }} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', margin: '10px 0' }} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" style={{ display: 'block' }}>Register</button>
    </form>
  );
};

export default Register;
