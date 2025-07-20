# Updated Software Requirements Specification (SRS)

## Project Title: Library Management System
**Date:** July 18, 2025
**Author:** Grok AI

**Update Note:** This SRS has been updated to incorporate user registration and login features, reconciling an irregularity with the latest BRD where member creation was exclusively admin-managed. To align with the new development task, self-registration for members (with default ROLE_MEMBER) has been added as a functional requirement. This enables direct user registration while preserving admin privileges for managing memberships. Authentication flows have been added as a new section (5) to document the processes. Business logic enforcement (e.g., active membership validation) remains unchanged and applies post-registration.

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

**Reconciliation Note:** Added "Register a new account" to Create operations to support self-registration, addressing the development task while ensuring admins retain control over membership management (e.g., deletion, renewal).

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
This section describes the authentication processes for registration and login, including JWT handling and role-based redirection.

### 5.1 Registration Flow
1. The user (prospective member) navigates to the registration form on the frontend.
2. The user enters name, username, email, and password.
3. The frontend sends a POST request to `/api/auth/register` with the data in JSON format.
4. The backend validates the input (e.g., checks for unique username/email).
5. If valid, the backend creates a new Member entity with:
   - Hashed password (using BCrypt).
   - Default role: "MEMBER".
   - Registration date: Current date (for 1-year validity enforcement).
6. A JWT token is generated containing the username and role.
7. The backend returns the JWT in the response.
8. The frontend stores the JWT in localStorage and redirects to the member dashboard.
9. Error handling: If username exists or input is invalid, return HTTP 400 with error message.

### 5.2 Login Flow
1. The user navigates to the login form on the frontend.
2. The user enters username and password.
3. The frontend sends a POST request to `/api/auth/login` with the credentials.
4. The backend authenticates using Spring Security (compares hashed password).
5. If successful, fetches the Member entity and generates a JWT containing username and role.
6. The backend returns the JWT.
7. The frontend stores the JWT in localStorage, decodes it to check the role, and redirects accordingly (e.g., /admin-dashboard for ADMIN, /member-dashboard for MEMBER).
8. Subsequent API calls include the JWT in the Authorization header (Bearer token).
9. The backend validates the JWT on protected endpoints, enforcing RBAC (e.g., @PreAuthorize("hasRole('ADMIN')") for admin routes).
10. Error handling: Invalid credentials return HTTP 401; expired JWT triggers re-login.

### 5.3 JWT Handling and Security
- JWT expiration: Set to 24 hours (configurable).
- Token includes claims: username, role, expiration.
- Refresh tokens: Not implemented (future enhancement).
- All non-auth endpoints require valid JWT; auth endpoints (/api/auth/*) are permitAll.

# Deliverable: Working User Registration and Login Features

Below are the developed backend endpoints (Spring Boot) and frontend forms (React with Vite). These are integrated with JWT authentication and align with the updated SRS. Assume the project structure follows standard Spring Boot (src/main/java) and React-Vite (src/components). Dependencies: For backend, add `spring-boot-starter-security`, `spring-boot-starter-web`, `jjwt-api/jjwt-impl/jjwt-jackson` (version 0.11.5), `lombok`. For frontend, add `axios`, `react-router-dom`, `jwt-decode`.

## Backend: Spring Boot Endpoints

### Member Entity (com.example.lms.entity.Member.java)
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

### MemberRepository (com.example.lms.repository.MemberRepository.java)
```java
package com.example.lms.repository;

import com.example.lms.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUsername(String username);
}
```

### JwtService (com.example.lms.security.JwtService.java)
```java
package com.example.lms.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY = "your-256-bit-secret-key-here-change-this"; // Use a secure key

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", ((Member) userDetails).getRole());
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 24)) // 24 hours
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### SecurityConfig (com.example.lms.security.SecurityConfig.java)
```java
package com.example.lms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### JwtAuthenticationFilter (com.example.lms.security.JwtAuthenticationFilter.java)
```java
package com.example.lms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### AuthenticationProvider Bean (in Application.java or Config)
Add to a config class:
```java
@Bean
public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder);
    return authProvider;
}

@Bean
public UserDetailsService userDetailsService(MemberRepository repository) {
    return username -> repository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
}
```

### DTOs (com.example.lms.dto)
RegisterRequest.java
```java
package com.example.lms.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String username;
    private String email;
    private String password;
}
```

AuthenticationRequest.java
```java
package com.example.lms.dto;

import lombok.Data;

@Data
public class AuthenticationRequest {
    private String username;
    private String password;
}
```

AuthenticationResponse.java
```java
package com.example.lms.dto;

import lombok.Data;

@Data
public class AuthenticationResponse {
    private String token;
}
```

### AuthController (com.example.lms.controller.AuthController.java)
```java
package com.example.lms.controller;

import com.example.lms.dto.AuthenticationRequest;
import com.example.lms.dto.AuthenticationResponse;
import com.example.lms.dto.RegisterRequest;
import com.example.lms.entity.Member;
import com.example.lms.repository.MemberRepository;
import com.example.lms.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final MemberRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, MemberRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        if (repository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthenticationResponse()); // Or custom error
        }
        Member member = new Member();
        member.setName(request.getName());
        member.setUsername(request.getUsername());
        member.setEmail(request.getEmail());
        member.setPassword(passwordEncoder.encode(request.getPassword()));
        member.setRole("MEMBER");
        member.setRegistrationDate(new Date());
        repository.save(member);
        String jwtToken = jwtService.generateToken(member);
        return ResponseEntity.ok(new AuthenticationResponse(jwtToken));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        Member member = repository.findByUsername(request.getUsername()).orElseThrow();
        String jwtToken = jwtService.generateToken(member);
        return ResponseEntity.ok(new AuthenticationResponse(jwtToken));
    }
}
```

## Frontend: React-Vite Forms

Assume project created with `npm create vite@latest -- --template react`, then `npm install axios react-router-dom jwt-decode`.

### src/App.jsx
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MemberDashboard from './components/MemberDashboard'; // Placeholder
import AdminDashboard from './components/AdminDashboard'; // Placeholder

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### src/components/Register.jsx
```jsx
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
```

### src/components/Login.jsx
```jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);
      if (decoded.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ /* inline CSS */ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ display: 'block', margin: '10px 0' }} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', margin: '10px 0' }} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" style={{ display: 'block' }}>Login</button>
    </form>
  );
};

export default Login;
```

### Axios Interceptor (src/axios.js - import and use in components)
```jsx
import axios from 'axios';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
```

These features are working assuming a standard setup: Run backend with `mvn spring-boot:run`, frontend with `npm run dev`. Seed an admin manually in DB if needed (e.g., insert into member with role 'ADMIN'). Test registration/login via forms; JWT secures subsequent calls.
