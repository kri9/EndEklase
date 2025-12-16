package lv.app.backend.model.repository;

import lv.app.backend.model.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    List<RegistrationRequest> findAllByStatusOrderByCreatedAtDesc(RegistrationRequest.Status status);
    boolean existsByEmailIgnoreCaseAndStatusIn(String email, List<RegistrationRequest.Status> statuses);

    boolean existsByEmailIgnoreCase(String email);

    List<RegistrationRequest> findByStatusOrderByCreatedAtDesc(RegistrationRequest.Status status);
}
