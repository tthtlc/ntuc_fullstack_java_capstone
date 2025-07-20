
import { useState, useEffect } from 'react';
import axios from 'axios';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/loans/my');
        setLoans(response.data);
      } catch (err) {
        setError('Failed to load loans');
      }
    };
    fetchLoans();
  }, []);

  const handleRenew = async (loanId) => {
    try {
      await axios.post(`http://localhost:8080/api/loans/renew/${loanId}`);
      alert('Loan renewed');
      // Refresh loans
      const response = await axios.get('http://localhost:8080/api/loans/my');
      setLoans(response.data);
    } catch (err) {
      alert('Renew failed');
    }
  };

  const handleReturn = async (loanId) => {
    try {
      await axios.post(`http://localhost:8080/api/loans/return/${loanId}`);
      alert('Book returned');
      // Refresh loans
      const response = await axios.get('http://localhost:8080/api/loans/my');
      setLoans(response.data);
    } catch (err) {
      alert('Return failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Loans</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Book Title</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Loan Date</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Due Date</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Return Date</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Fine</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{loan.book.title}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(loan.loanDate).toLocaleDateString()}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(loan.dueDate).toLocaleDateString()}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'Not Returned'}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>${loan.fine}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                {!loan.returnDate && (
                  <>
                    <button onClick={() => handleRenew(loan.id)} style={{ marginRight: '5px' }}>Renew</button>
                    <button onClick={() => handleReturn(loan.id)}>Return</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Loans;
