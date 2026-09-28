package _AD013.project.usecase.Repository;

import _AD013.project.usecase.Modals.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

}