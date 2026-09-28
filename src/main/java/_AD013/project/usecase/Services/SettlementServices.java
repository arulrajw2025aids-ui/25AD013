package _AD013.project.usecase.Services;

import _AD013.project.usecase.Modals.Settlement;
import _AD013.project.usecase.Repository.SettlementRepository;
import _AD013.project.usecase.Repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SettlementServices {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private TripRepository tripRepository;

    public Settlement createSettlement(Settlement data) {

        if (!tripRepository.existsById(data.getTripId())) {
            throw new RuntimeException(
                    "Trip ID " + data.getTripId() + " does not exist"
            );
        }

        if (data.getAmount() == null || data.getAmount() <= 0) {
            throw new RuntimeException(
                    "Settlement amount must be greater than 0"
            );
        }

        data.setStatus("PENDING");

        return settlementRepository.save(data);
    }

    public List<Settlement> getAllSettlements() {
        return settlementRepository.findAll();
    }

    public List<Settlement> getSettlementsByTrip(Long tripId) {

        if (!tripRepository.existsById(tripId)) {
            throw new RuntimeException(
                    "Trip ID " + tripId + " does not exist"
            );
        }

        return settlementRepository.findByTripId(tripId);
    }

    public Settlement getSettlementById(Long id) {

        return settlementRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Settlement ID " + id + " not found"
                        ));
    }

    public Settlement updateSettlement(Settlement data) {

        if (!settlementRepository.existsById(data.getId())) {
            throw new RuntimeException(
                    "Settlement ID " + data.getId() + " does not exist"
            );
        }

        if (!tripRepository.existsById(data.getTripId())) {
            throw new RuntimeException(
                    "Trip ID " + data.getTripId() + " does not exist"
            );
        }

        return settlementRepository.save(data);
    }

    public Settlement markAsPaid(Long id) {

        Settlement settlement = settlementRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Settlement ID " + id + " not found"
                        ));

        settlement.setStatus("PAID");

        return settlementRepository.save(settlement);
    }

    public void deleteSettlement(Long id) {

        if (!settlementRepository.existsById(id)) {
            throw new RuntimeException(
                    "Settlement ID " + id + " does not exist"
            );
        }

        settlementRepository.deleteById(id);
    }
}