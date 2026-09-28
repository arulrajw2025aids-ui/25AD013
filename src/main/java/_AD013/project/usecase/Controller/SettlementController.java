package _AD013.project.usecase.Controller;

import _AD013.project.usecase.Modals.Settlement;
import _AD013.project.usecase.Services.SettlementServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/settlements")
@CrossOrigin
public class SettlementController {

    @Autowired
    private SettlementServices settlementServices;

    @PostMapping
    public Settlement createSettlement(
            @RequestBody Settlement data) {

        return settlementServices.createSettlement(data);
    }

    @GetMapping
    public List<Settlement> getAllSettlements() {

        return settlementServices.getAllSettlements();
    }

    @GetMapping("/trip/{tripId}")
    public List<Settlement> getSettlementsByTrip(
            @PathVariable Long tripId) {

        return settlementServices.getSettlementsByTrip(tripId);
    }

    @GetMapping("/{id}")
    public Settlement getSettlementById(
            @PathVariable Long id) {

        return settlementServices.getSettlementById(id);
    }

    @PutMapping
    public Settlement updateSettlement(
            @RequestBody Settlement data) {

        return settlementServices.updateSettlement(data);
    }

    @PutMapping("/{id}/paid")
    public Settlement markAsPaid(
            @PathVariable Long id) {

        return settlementServices.markAsPaid(id);
    }

    @DeleteMapping("/{id}")
    public String deleteSettlement(
            @PathVariable Long id) {

        settlementServices.deleteSettlement(id);

        return "Settlement deleted successfully";
    }
}