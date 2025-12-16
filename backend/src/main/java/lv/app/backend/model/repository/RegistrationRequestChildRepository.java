package lv.app.backend.model.repository;

import lv.app.backend.model.RegistrationRequestChild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRequestChildRepository extends JpaRepository<RegistrationRequestChild, Long> {
    List<RegistrationRequestChild> findByRequestId(Long requestId);
}

