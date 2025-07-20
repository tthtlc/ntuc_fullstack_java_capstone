
import { useState, useEffect } from 'react';
import axios from 'axios';

const Borrow = () => {
  const [books, setBooks] = useState([]);
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableBooks = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/books/available');
        setBooks(response.data);
      } catch (err) {
        setError('Failed to load books');
      }
    };
    fetchAvailableBooks();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/loans/borrow', null, { params: { isbn } });
      alert('Book borrowed');
      setIsbn('');
      // Refresh available books
      const response = await axios.get('http://localhost:8080/api/books/available');
      setBooks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Borrow failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Borrow Book</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleBorrow}>
        <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="Enter ISBN" required style={{ display: 'block', margin: '10px 0' }} />
        <button type="submit" style={{ display: 'block' }}>Borrow</button>
      </form>
      <h3>Available Books</h3>
      <ul>
        {books.map(book => (
          <li key={book.id}>{book.title} by {book.author} (ISBN: {book.isbn})</li>
        ))}
      </ul>
    </div>
  );
};

export default Borrow;
