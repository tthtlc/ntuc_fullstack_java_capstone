
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



