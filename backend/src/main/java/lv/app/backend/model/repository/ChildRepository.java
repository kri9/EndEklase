package lv.app.backend.model.repository;

import lv.app.backend.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {

    List<Child> findByGroupId(Long groupId);

    @Query(value = "select c.* from children c join attendances a on c.id = a.child_id where a.id=?1", nativeQuery = true)
    Child findEvenDeletedChild(Long attendanceId);
}
