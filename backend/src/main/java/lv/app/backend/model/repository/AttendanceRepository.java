package lv.app.backend.model.repository;

import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByChildIdAndLessonId(Long childId, Long lessonId);

    List<Attendance> findByLessonGroupId(Long groupId);

    List<Attendance> findByLesson_Group_IdAndLesson_DateBetween(Long groupId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByChildParentId(Long userId);

    @Query("""
            select distinct a from Lesson l
            join l.attendances a
            where l.date >= ?1 and l.date <= ?2 and a.child in (?3) and a.invoice is NULL and a.status = 'ATTENDED'
            """)
    List<Attendance> findAttendanceToPayForChildren(LocalDate start, LocalDate end, List<Child> child);

    void deleteByChildId(Long childId);
}
