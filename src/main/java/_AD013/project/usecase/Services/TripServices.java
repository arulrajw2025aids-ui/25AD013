package _AD013.project.usecase.Services;

import _AD013.project.usecase.Modals.Trip;
import _AD013.project.usecase.Repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripServices {

    @Autowired
    private TripRepository triprepository;

    public Trip createtrip(Trip data) {
        Trip result = triprepository.save(data);
        return result;
    }

    public List<Trip> getalltrip() {
        return triprepository.findAll();
    }

    public Trip updatetrip(Trip data) {
        return triprepository.save(data);
    }

    public void deletetrip(long id) {
        triprepository.deleteById(id);
    }
}