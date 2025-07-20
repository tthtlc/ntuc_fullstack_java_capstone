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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/borrow" element={<Borrow />} />
      </Routes>
    </Router>
  );
}

export default App;
