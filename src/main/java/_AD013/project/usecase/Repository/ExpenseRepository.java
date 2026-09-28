package _AD013.project.usecase.Repository;

import _AD013.project.usecase.Modals.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

}