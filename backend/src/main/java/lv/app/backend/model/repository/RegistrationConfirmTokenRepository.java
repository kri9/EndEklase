package lv.app.backend.model.repository;

import lv.app.backend.model.RegistrationConfirmToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationConfirmTokenRepository extends JpaRepository<RegistrationConfirmToken, Long> {
    Optional<RegistrationConfirmToken> findByToken(String token);
}
