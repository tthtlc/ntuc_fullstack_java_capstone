import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MemberDashboard from './components/MemberDashboard';
import Profile from './components/Profile';
import Loans from './components/Loans';
import Borrow from './components/Borrow';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div><h1>Welcome to LMS</h1><a href="/login">Login</a> | <a href="/register">Register</a></div>} /> {/* Added root route for testing */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/borrow" element={<Borrow />} />
        <Route path="*" element={<div><h1>404 - Page Not Found</h1><a href="/">Go Home</a></div>} /> {/* Added catch-all for unresponsive routes */}
      </Routes>
    </Router>
  );
}

export default App;
