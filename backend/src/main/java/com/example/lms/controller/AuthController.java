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
