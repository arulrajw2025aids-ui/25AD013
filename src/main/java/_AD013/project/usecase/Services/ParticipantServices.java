package _AD013.project.usecase.Services;

import _AD013.project.usecase.Modals.Participant;
import _AD013.project.usecase.Repository.ParticipantRepository;
import _AD013.project.usecase.Repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipantServices {

    @Autowired
    private ParticipantRepository participantrepository;

    @Autowired
    private TripRepository triprepository;

    public Participant createparticipant(Participant data) {
        if (!triprepository.existsById(data.getTripId())) {
            throw new RuntimeException("Trip ID " + data.getTripId() + " does not exist");
        }

        Participant result = participantrepository.save(data);
        return result;
    }

    public List<Participant> getallparticipant() {
        return participantrepository.findAll();
    }

    public Participant updateparticipant(Participant data) {
        if (!triprepository.existsById(data.getTripId())) {
            throw new RuntimeException("Trip ID " + data.getTripId() + " does not exist");
        }

        return participantrepository.save(data);
    }

    public void deleteparticipant(long id) {
        participantrepository.deleteById(id);
    }
}