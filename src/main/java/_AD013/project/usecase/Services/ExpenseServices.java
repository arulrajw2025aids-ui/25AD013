package _AD013.project.usecase.Services;

import _AD013.project.usecase.Modals.Expense;
import _AD013.project.usecase.Modals.Participant;
import _AD013.project.usecase.Modals.Trip;
import _AD013.project.usecase.Repository.ExpenseRepository;
import _AD013.project.usecase.Repository.ParticipantRepository;
import _AD013.project.usecase.Repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseServices {
    @Autowired
    private ExpenseRepository expenserepository;

    @Autowired
    private ParticipantRepository participantrepository;

    @Autowired
    private TripRepository triprepository;

    public Expense createexpense(Expense data) {
        if (!participantrepository.existsById(data.getParticipantId())) {
            throw new RuntimeException(
                    "Participant ID " + data.getParticipantId() + " does not exist"
            );
        }
        if (!triprepository.existsById(data.getTripId())) {
            throw new RuntimeException(
                    "Trip ID " + data.getTripId() + " does not exist"
            );
        }
        Participant participant =
                participantrepository.findById(data.getParticipantId()).get();

        // Check participant belongs to trip
        if (!participant.getTripId().equals(data.getTripId())) {
            throw new RuntimeException(
                    "Participant does not belong to this trip"
            );
        }
        Trip trip = triprepository.findById(data.getTripId()).get();
        float totalBudget = trip.getBudget();
        
        long numberOfParticipants = participantrepository.findAll().stream()
                .filter(p -> p.getTripId() != null && p.getTripId().equals(data.getTripId()))
                .count();
                
        if (numberOfParticipants <= 0) {
            throw new RuntimeException(
                    "Number of participants must be greater than zero"
            );
        }
        float share = totalBudget / numberOfParticipants;
        data.setTotalBudget(totalBudget);
        data.setShare(share);

        return expenserepository.save(data);
    }

    public List<Expense> getallexpense() {
        return expenserepository.findAll();
    }

    public Expense updateexpense(Expense data) {
        return expenserepository.save(data);
    }

    public void deleteexpense(long id) {
        expenserepository.deleteById(id);
    }
}