

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
}1
