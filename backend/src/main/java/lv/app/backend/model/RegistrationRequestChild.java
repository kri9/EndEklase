package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "registration_request_children")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistrationRequestChild {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "request_id")
    private RegistrationRequest request;

    private String firstname;
    private String lastname;
}
