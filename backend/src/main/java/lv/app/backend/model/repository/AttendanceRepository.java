package lv.app.backend.model.repository;

import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.User;
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

    @Query(value = """
            select distinct a.* from lessons l
            join attendances a on l.id = a.lesson_id
            left join invoice i on a.invoice_id = i.id
            where l.date > ?1 and l.date <= ?2 
              and a.child_id in (?3) 
              and (a.invoice_id is NULL or i.deleted = true) 
              and a.status = 'ATTENDED'
            """, nativeQuery = true)
    List<Attendance> findAttendanceToPayForChildren(LocalDate start, LocalDate end, List<Long> children);

    @Query(value = """
            select distinct a.* from lessons l
            join attendances a on l.id = a.lesson_id
            join public.children c on a.child_id = c.id
            left join invoice i on a.invoice_id = i.id
            where c.parent_id = ?1
                and (a.invoice_id is NULL or i.deleted = true)
                and a.status = 'ATTENDED'
            """, nativeQuery = true)
    List<Attendance> findAttendanceToPayForUser(Long userId);

    void deleteByChildId(Long childId);
}
