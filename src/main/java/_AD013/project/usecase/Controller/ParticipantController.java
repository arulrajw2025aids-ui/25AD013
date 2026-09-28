package _AD013.project.usecase.Controller;

import _AD013.project.usecase.Modals.Participant;
import _AD013.project.usecase.Services.ParticipantServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/participant")
public class ParticipantController {

    @Autowired
    private ParticipantServices participantServices;

    @PostMapping("/create")
    ResponseEntity<Participant> createparticipant(@RequestBody Participant body) {
        return new ResponseEntity<>(
                participantServices.createparticipant(body),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/getall")
    ResponseEntity<List<Participant>> getall() {
        return new ResponseEntity<>(
                participantServices.getallparticipant(),
                HttpStatus.OK
        );
    }

    @PutMapping("/update")
    ResponseEntity<Participant> updateparticipant(@RequestBody Participant data) {
        return new ResponseEntity<>(
                participantServices.updateparticipant(data),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/delete/{id}")
    ResponseEntity<String> deleteparticipant(@PathVariable long id) {

        participantServices.deleteparticipant(id);

        return new ResponseEntity<>(
                "Participant deleted successfully",
                HttpStatus.OK
        );
    }
}