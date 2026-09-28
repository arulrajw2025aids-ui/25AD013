package _AD013.project.usecase.Repository;

import _AD013.project.usecase.Modals.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository
        extends JpaRepository<Settlement, Long> {

    List<Settlement> findByTripId(Long tripId);
}