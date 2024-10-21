package lv.app.backend.model.repository;

import lv.app.backend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByGroupId(Long groupId);
}
