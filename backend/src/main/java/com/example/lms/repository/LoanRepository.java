
package com.example.lms.repository;

import com.example.lms.entity.Loan;
import com.example.lms.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByMember(Member member);
    List<Loan> findByBookIdAndReturnDateIsNull(Long bookId);
}
