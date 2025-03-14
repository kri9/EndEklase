package lv.app.backend.model.repository;

import lv.app.backend.model.Kindergarten;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KindergartenRepository extends JpaRepository<Kindergarten, Long> {

    Optional<Kindergarten> findKindergartenByName(String name);

}
