
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
