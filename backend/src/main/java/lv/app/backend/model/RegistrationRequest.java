package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "registration_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistrationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;

    @Column(name = "kindergarten_id")
    private Long kindergartenId;

    @Column(name = "group_id")
    private Long groupId;

    @Enumerated(EnumType.STRING)
    private Status status;

    private boolean emailConfirmed;

    private java.time.LocalDateTime createdAt;

    public enum Status {
        EMAIL_PENDING,
        APPROVAL_PENDING,
        APPROVED,
        REJECTED
    }
}
