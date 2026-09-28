package _AD013.project.usecase.Repository;
import _AD013.project.usecase.Modals.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {

}