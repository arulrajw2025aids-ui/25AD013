package _AD013.project.usecase.Controller;

import _AD013.project.usecase.Modals.Expense;
import _AD013.project.usecase.Services.ExpenseServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/expense")
public class ExpenseController {

    @Autowired
    private ExpenseServices expenseServices;

    @PostMapping("/create")
    ResponseEntity<Expense> createexpense(@RequestBody Expense body) {
        return new ResponseEntity<>(
                expenseServices.createexpense(body),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/getall")
    ResponseEntity<List<Expense>> getall() {
        return new ResponseEntity<>(
                expenseServices.getallexpense(),
                HttpStatus.OK
        );
    }

    @PutMapping("/update")
    ResponseEntity<Expense> updateexpense(@RequestBody Expense data) {
        return new ResponseEntity<>(
                expenseServices.updateexpense(data),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/delete/{id}")
    ResponseEntity<String> deleteexpense(@PathVariable long id) {

        expenseServices.deleteexpense(id);

        return new ResponseEntity<>(
                "Expense deleted successfully",
                HttpStatus.OK
        );
    }
}