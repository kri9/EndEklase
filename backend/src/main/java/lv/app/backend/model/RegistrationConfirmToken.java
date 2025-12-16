package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registration_confirm_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistrationConfirmToken {
    @Id
    private String token;

    @ManyToOne(optional = false)
    @JoinColumn(name = "request_id")
    private RegistrationRequest request;

    private java.time.LocalDateTime expiryDate;
}
