package _AD013.project.usecase.Controller;

import _AD013.project.usecase.Modals.Trip;
import _AD013.project.usecase.Services.TripServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/trip")
public class TripController {

    @Autowired
    private TripServices tripServices;

    @PostMapping("/create")
    ResponseEntity<Trip> createtrip(@RequestBody Trip body) {
        return new ResponseEntity<>(tripServices.createtrip(body), HttpStatus.CREATED);
    }

    @GetMapping("/getall")
    ResponseEntity<List<Trip>> getall() {
        return new ResponseEntity<>(tripServices.getalltrip(), HttpStatus.OK);
    }

    @PutMapping("/update")
    ResponseEntity<Trip> updatetrip(@RequestBody Trip data) {
        return new ResponseEntity<>(tripServices.updatetrip(data), HttpStatus.ACCEPTED);
    }
}