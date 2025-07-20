
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Member Dashboard</h1>
      <Link to="/profile" style={{ display: 'block', margin: '10px' }}>View/Update Profile</Link>
      <Link to="/loans" style={{ display: 'block', margin: '10px' }}>View Loans</Link>
      <Link to="/borrow" style={{ display: 'block', margin: '10px' }}>Borrow Book</Link>
    </div>
  );
};

export default MemberDashboard;
