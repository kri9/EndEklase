package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.mappers.LessonMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Group;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.enums.AttendanceStatus;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.ChildRepository;
import lv.app.backend.model.repository.GroupRepository;
import lv.app.backend.model.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonService {

    private final EntityMapper entityMapper;
    private final LessonMapper lessonMapper;
    private final GroupRepository groupRepository;
    private final ChildRepository childRepository;
    private final LessonRepository lessonRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public void updateLesson(LessonDTO lessonDTO) {
        Lesson lesson = lessonRepository.findById(lessonDTO.getId())
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        if (lesson.getAttendances().stream().anyMatch(a -> a.getInvoice() != null)) {
            throw new RuntimeException("Lesson " + lessonDTO.getId() + " has already been attended");
        }
        lessonMapper.updateLesson(lesson, lessonDTO);
        lessonRepository.save(lesson);
    }

    @Transactional
    public void saveLesson(LessonDTO lessonDTO) {
        Group group = groupRepository.findById(lessonDTO.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid group ID"));

        Lesson lesson = lessonMapper.dtoToLesson(lessonDTO);
        lesson.setGroup(group);
        lessonRepository.saveAndFlush(lesson);
        linkChildrenWithLesson(lesson);
    }

    public void linkChildrenWithLesson(Lesson lesson) {
        Group group = lesson.getGroup();
        group.getChildren().forEach(c ->
                attendanceRepository.saveAndFlush(Attendance.builder()
                        .lesson(lesson)
                        .child(c)
                        .status(AttendanceStatus.NOT_ATTENDED)
                        .build())
        );
    }

    public List<LessonDTO> getLessonsByGroup(Long groupId) {
        List<Lesson> lessons = lessonRepository.findByGroupId(groupId);
        System.out.println("Fetched Lessons for Group ID " + groupId + ": " + lessons);
        return lessons.stream()
                .map(lessonMapper::lessonToDto)
                .collect(Collectors.toList());
    }

    public List<LessonDTO> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(lessonMapper::lessonToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO upsertAttendanceStatus(Long childId, Long lessonId, boolean attended) {
        log.trace("Upserting attendance for childId: {}, lessonId: {}, attended: {}", childId, lessonId, attended);

        Attendance attendance = attendanceRepository.findByChildIdAndLessonId(childId, lessonId)
                .orElseGet(() -> {
                    Attendance a = new Attendance();
                    a.setChild(
                            childRepository.findById(childId)
                                    .orElseThrow(() -> new IllegalArgumentException("Child not found: " + childId))
                    );
                    a.setLesson(
                            lessonRepository.findById(lessonId)
                                    .orElseThrow(() -> new IllegalArgumentException("Lesson not found: " + lessonId))
                    );
                    return a;
                });

        attendance.setStatus(attended ? AttendanceStatus.ATTENDED : AttendanceStatus.NOT_ATTENDED);
        Attendance saved = attendanceRepository.saveAndFlush(attendance);
        return entityMapper.attendanceToDto(saved);
    }

    @Transactional
    public List<AttendanceDTO> getAttendanceByGroup(Long groupId) {
        List<Attendance> attendances = attendanceRepository.findByLessonGroupId(groupId);
        return attendances.stream()
                .filter(Attendance::hasRelatedChild)
                .map(entityMapper::attendanceToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<LessonDTO> getLessonsByUser(Long userId) {
        List<Lesson> lessons = lessonRepository.findLessonsByUserId(userId);
        return lessons.stream()
                .map(lessonMapper::lessonToDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public List<AttendanceDTO> getAttendanceByGroupAndMonth(Long groupId, YearMonth month) {
        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();
        List<Attendance> attendances = attendanceRepository.findByLesson_Group_IdAndLesson_DateBetween(
                groupId, startDate, endDate
        );
        return attendances.stream()
                .filter(Attendance::hasRelatedChild)
                .map(entityMapper::attendanceToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AttendanceDTO> getAttendanceByUser(Long userId) {
        List<Attendance> attendances = attendanceRepository.findByChildParentId(userId);
        return attendances.stream()
                .filter(Attendance::hasRelatedChild)
                .map(entityMapper::attendanceToDto)
                .collect(Collectors.toList());
    }

    public LessonDTO getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .map(lessonMapper::lessonToDto)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found for lessonId: " + lessonId));
    }
}