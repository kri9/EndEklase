package lv.app.backend.model.repository;

import lv.app.backend.model.Group;
import lv.app.backend.model.Kindergarten;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    Optional<Group> findGroupByKindergartenAndName(Kindergarten kindergarten, String name);

}
