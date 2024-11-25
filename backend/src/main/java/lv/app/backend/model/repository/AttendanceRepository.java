package lv.app.backend.model.repository;

import lv.app.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByChildIdAndLessonId(Long childId, Long lessonId);

    List<Attendance> findByLessonGroupId(Long groupId);

    List<Attendance> findByLesson_Group_IdAndLesson_DateBetween(Long groupId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByChildParentId(Long userId);

    void deleteByChildId(Long childId);
}
