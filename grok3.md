
# Updated Software Requirements Specification (SRS)

## Project Title: Library Management System
**Date:** July 20, 2025
**Author:** Grok AI

**Update Note:** This SRS has been updated to incorporate the member features for profile management, loan viewing, borrowing, renewing, and returning books with fine calculation. New backend APIs and frontend components have been added. Business logic for borrowing eligibility (active membership within 1 year, no overdue books, borrow limit of 3), renewal eligibility (up to 2 extensions, not overdue), fine calculation ($0.50 per day per book, capped at $20), and book availability tracking are now explicitly defined in functional requirements and implemented in code.

## 1. Introduction
This document outlines the functional and non-functional requirements for the Library Management System (LMS) developed as a full-stack web application. The system is designed to facilitate efficient book borrowing, member management, and administrative tasks. It is developed using React for the frontend, Spring Boot for the backend, and MySQL database.

## 2. Functional Requirements
The section describes what the system should do. These are the core services, tasks, and user interactions the system must support.

### 2.1 Members Requirements
Member of the system can:
- Be directed to and access a Member Dashboard
- Register and log in securely using JWT authentication.
- View their own profile information.
- Update their own profile (name, username, email, password).
- View their currently borrowed books and loan history.
- Borrow available books (limited to 3 active loans).
- Renew loans if eligible.
- Return books and calculate fines based on overdue days.
- Are restricted from borrowing if they have:
  - Overdue books.
  - More than 3 active loans.
  - Expired membership.

#### CRUD operations for Members based on the Members Requirements:
| CRUD Operations | Function |
|-----------------|----------|
| Create | Register a new account |
| Read | View their personal profile details<br>View current and historical book loans<br>View loan due dates and fines (if any) |
| Update | Update their profile information, including name, email, username, and password<br>Renew a loan (extends due date)<br>Return a borrowed book (concurrently, sets return date and calculates fine) |
| Delete | Not applicable to members for safety — account deletion is handled by admin |

### 2.2 Administrators Requirements
Administrator of the system can:
- Log in with elevated privileges using JWT authentication.
- View, search, and manage all members and their loan activity.
- Add new members and delete existing ones.
- Update any member's profile and membership status.
- Renew a member's membership (updates registration date).
- Search loan records by member name.
- Add new books to the system collection.
- View all books in the library.
- Create a new loan by entering a member's ID and a book's ISBN.
- Extend member’s existing loan.
- Delete any loan record.
- View all current loan records in tabular format.

#### CRUD operations for Administrator based on the Administrators Requirements:
| CRUD Operations | Function |
|-----------------|----------|
| Create | Add new books to the library<br>Add new members<br>Create new loan records (carry out the book loan process for the member) |
| Read | View all books, all members, and all loan records<br>Search loans by member name<br>View individual member details by ID<br>View book details by ISBN or ID |
| Update | Update any member’s profile or membership date<br>Update own profile (administrator separate form)<br>Renew membership (resets registration_date to current date in the RenewMembership form)<br>Extend loans (function programmed to stop after 2 extensions) |
| Delete | Delete Member<br>Delete Book (future frontend feature enhancement, endpoint and backend delete function already available)<br>Delete Loan Record (future frontend feature enhancement, endpoint and backend delete function already available) |

## 3. Non-Functional Requirements
This section defines how the system should behave. These relate to quality attributes and system-wide constraints rather than specific behaviors.

### 3.1 User Interface
The UI must be clean, user-friendly, and intuitive for both members and admins.

### 3.2 Authentication and access control
The system must enforce role-based access control (RBAC) with secure JWT.
Passwords must be securely stored using BCrypt hashing.
All API endpoints must be protected and only accessible with proper roles.

### 3.3 Cross Origin Requests (CORS)
The application should support cross-origin requests between frontend (http://localhost:5173) and backend (http://localhost:8080).

### 3.4 Load Handling
The system should handle up to 100 concurrent users in a test environment.

### 3.5 System Backend Components Design
System components should follow separation of concerns (e.g., services, controllers, repositories).

### 3.6 Error Handling and Exception Handling
The frontend must gracefully handle HTTP errors and display user-friendly messages.

## 4. System Constraints
The frontend is developed using React 19.1.0 with JSX and uses inline styling.
The backend is implemented with Spring Boot 3.x using Maven for build automation.
The database is MySQL 8.0, connected via Spring Data JPA / Hibernate.
Authentication is managed using JWT (JSON Web Token) with role-based access control.
No external UI libraries (e.g., Bootstrap, Material UI) were used.
Styling is implemented using inline CSS-in-JS in React components.
The application is designed to run locally and assumes a development environment.

## 5. Authentication Flows
[Unchanged from previous version]

# Deliverable: Working Member Features with Frontend and Backend Implementation

Below is the implementation for the member features: dashboard, profile view/update, loan viewing, borrowing, renewing, and returning books. This builds on the previous authentication code. The backend connects to MySQL via Spring Data JPA/Hibernate. Assume the following additions to the backend `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

And in `application.properties` (or `.yml`):

```
spring.datasource.url=jdbc:mysql://localhost:3306/lms_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

The loan due period is assumed to be 14 days. Fine calculation occurs on return. Book availability is checked by ensuring no active loan (returnDate == null) exists for the book.

## Backend: Spring Boot Implementation

### Updated Member Entity (com.example.lms.entity.Member.java)
Added imports and fields for completeness.
```java
package com.example.lms.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "member")
public class Member implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String username;
    private String email;
    private String password;
    private Date registrationDate;
    private String role; // "ADMIN" or "MEMBER"

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<Loan> loans;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

### Book Entity (com.example.lms.entity.Book.java)
```java
package com.example.lms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "book")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;
    @Column(unique = true)
    private String isbn;
}
```

### Loan Entity (com.example.lms.entity.Loan.java)
```java
package com.example.lms.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "loan")
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    private Date loanDate;
    private Date dueDate;
    private Date returnDate;
    private double fine;
    private int extensions;
}
```

### BookRepository (com.example.lms.repository.BookRepository.java)
```java
package com.example.lms.repository;

import com.example.lms.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
}
```

### LoanRepository (com.example.lms.repository.LoanRepository.java)
```java
package com.example.lms.repository;

import com.example.lms.entity.Loan;
import com.example.lms.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByMember(Member member);
    List<Loan> findByBookIdAndReturnDateIsNull(Long bookId);
}
```

### DTO for Profile Update (com.example.lms.dto.MemberUpdateDto.java)
```java
package com.example.lms.dto;

import lombok.Data;

@Data
public class MemberUpdateDto {
    private String name;
    private String email;
    private String username;
    private String password;
}
```

### MemberService (com.example.lms.service.MemberService.java)
```java
package com.example.lms.service;

import com.example.lms.dto.MemberUpdateDto;
import com.example.lms.entity.Member;
import com.example.lms.repository.MemberRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Member getCurrentMember() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return memberRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public Member updateProfile(MemberUpdateDto dto) {
        Member member = getCurrentMember();
        if (dto.getName() != null) member.setName(dto.getName());
        if (dto.getEmail() != null) member.setEmail(dto.getEmail());
        if (dto.getUsername() != null) member.setUsername(dto.getUsername());
        if (dto.getPassword() != null) member.setPassword(passwordEncoder.encode(dto.getPassword()));
        return memberRepository.save(member);
    }
}
```

### LoanService (com.example.lms.service.LoanService.java)
```java
package com.example.lms.service;

import com.example.lms.entity.Book;
import com.example.lms.entity.Loan;
import com.example.lms.entity.Member;
import com.example.lms.repository.BookRepository;
import com.example.lms.repository.LoanRepository;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberService memberService;

    public LoanService(LoanRepository loanRepository, BookRepository bookRepository, MemberService memberService) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberService = memberService;
    }

    public List<Loan> getMyLoans() {
        Member member = memberService.getCurrentMember();
        return loanRepository.findByMember(member);
    }

    public void borrowBook(String isbn) {
        Member member = memberService.getCurrentMember();
        // Check membership validity (1 year)
        Calendar cal = Calendar.getInstance();
        cal.setTime(member.getRegistrationDate());
        cal.add(Calendar.YEAR, 1);
        if (cal.getTime().before(new Date())) {
            throw new RuntimeException("Membership expired");
        }
        // Check active loans < 3
        long activeLoans = getMyLoans().stream().filter(loan -> loan.getReturnDate() == null).count();
        if (activeLoans >= 3) {
            throw new RuntimeException("Borrow limit reached");
        }
        // Check no overdue
        boolean hasOverdue = getMyLoans().stream().anyMatch(loan -> loan.getReturnDate() == null && loan.getDueDate().before(new Date()));
        if (hasOverdue) {
            throw new RuntimeException("Has overdue books");
        }
        // Find book
        Book book = bookRepository.findByIsbn(isbn).orElseThrow(() -> new RuntimeException("Book not found"));
        // Check availability
        if (!loanRepository.findByBookIdAndReturnDateIsNull(book.getId()).isEmpty()) {
            throw new RuntimeException("Book not available");
        }
        // Create loan
        Loan loan = new Loan();
        loan.setBook(book);
        loan.setMember(member);
        loan.setLoanDate(new Date());
        cal.setTime(new Date());
        cal.add(Calendar.DAY_OF_MONTH, 14);
        loan.setDueDate(cal.getTime());
        loan.setExtensions(0);
        loanRepository.save(loan);
    }

    public void renewLoan(Long loanId) {
        Member member = memberService.getCurrentMember();
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        if (!loan.getMember().equals(member)) {
            throw new RuntimeException("Not your loan");
        }
        if (loan.getReturnDate() != null) {
            throw new RuntimeException("Already returned");
        }
        if (loan.getDueDate().before(new Date())) {
            throw new RuntimeException("Overdue, cannot renew");
        }
        if (loan.getExtensions() >= 2) {
            throw new RuntimeException("Max renewals reached");
        }
        Calendar cal = Calendar.getInstance();
        cal.setTime(loan.getDueDate());
        cal.add(Calendar.DAY_OF_MONTH, 14);
        loan.setDueDate(cal.getTime());
        loan.setExtensions(loan.getExtensions() + 1);
        loanRepository.save(loan);
    }

    public void returnLoan(Long loanId) {
        Member member = memberService.getCurrentMember();
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        if (!loan.getMember().equals(member)) {
            throw new RuntimeException("Not your loan");
        }
        if (loan.getReturnDate() != null) {
            throw new RuntimeException("Already returned");
        }
        Date now = new Date();
        loan.setReturnDate(now);
        if (now.after(loan.getDueDate())) {
            long diff = now.getTime() - loan.getDueDate().getTime();
            long days = TimeUnit.DAYS.convert(diff, TimeUnit.MILLISECONDS);
            loan.setFine(Math.min(20, 0.5 * days));
        } else {
            loan.setFine(0);
        }
        loanRepository.save(loan);
    }

    public List<Book> getAvailableBooks() {
        List<Book> allBooks = bookRepository.findAll();
        return allBooks.stream().filter(book -> loanRepository.findByBookIdAndReturnDateIsNull(book.getId()).isEmpty()).toList();
    }
}
```

### MemberController (com.example.lms.controller.MemberController.java)
```java
package com.example.lms.controller;

import com.example.lms.dto.MemberUpdateDto;
import com.example.lms.entity.Member;
import com.example.lms.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@PreAuthorize("hasRole('MEMBER')")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/me")
    public ResponseEntity<Member> getProfile() {
        return ResponseEntity.ok(memberService.getCurrentMember());
    }

    @PutMapping("/me")
    public ResponseEntity<Member> updateProfile(@RequestBody MemberUpdateDto dto) {
        return ResponseEntity.ok(memberService.updateProfile(dto));
    }
}
```

### LoanController (com.example.lms.controller.LoanController.java)
```java
package com.example.lms.controller;

import com.example.lms.entity.Book;
import com.example.lms.entity.Loan;
import com.example.lms.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@PreAuthorize("hasRole('MEMBER')")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Loan>> getMyLoans() {
        return ResponseEntity.ok(loanService.getMyLoans());
    }

    @PostMapping("/borrow")
    public ResponseEntity<Void> borrow(@RequestParam String isbn) {
        loanService.borrowBook(isbn);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/renew/{loanId}")
    public ResponseEntity<Void> renew(@PathVariable Long loanId) {
        loanService.renewLoan(loanId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/return/{loanId}")
    public ResponseEntity<Void> returnBook(@PathVariable Long loanId) {
        loanService.returnLoan(loanId);
        return ResponseEntity.ok().build();
    }
}
```

### BookController (com.example.lms.controller.BookController.java) - For member view available books
```java
package com.example.lms.controller;

import com.example.lms.entity.Book;
import com.example.lms.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@PreAuthorize("hasRole('MEMBER')")
public class BookController {

    private final LoanService loanService; // Reuse for available

    public BookController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        return ResponseEntity.ok(loanService.getAvailableBooks());
    }
}
```

## Frontend: React-Vite Implementation

Add routes to `src/App.jsx`:

```jsx
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
```

### MemberDashboard.jsx (src/components/MemberDashboard.jsx)
```jsx
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
```

### Profile.jsx (src/components/Profile.jsx)
```jsx
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
```

### Loans.jsx (src/components/Loans.jsx)
```jsx
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
```

### Borrow.jsx (src/components/Borrow.jsx)
```jsx
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
```

These components use inline CSS and Axios for API calls (with token from localStorage via interceptor). Test by registering/logging in as member, navigating to dashboard, and performing actions. Errors are handled with alerts/messages. Admin features are not implemented here but can be extended similarly.
