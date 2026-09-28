package _AD013.project.usecase.Modals;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;

    private Long fromParticipantId;

    private Long toParticipantId;

    private Double amount;

    private String status;
}