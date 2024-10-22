package lv.app.backend.model.repository;

import lv.app.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByChildIdAndLessonId(Long childId, Long lessonId);
}
