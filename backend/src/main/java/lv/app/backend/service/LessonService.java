package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.ToString;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Group;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.enums.AttendanceStatus;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.GroupRepository;
import lv.app.backend.model.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final EntityMapper entityMapper;
    private final GroupRepository groupRepository;
    private final LessonRepository lessonRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public void saveLesson(LessonDTO lessonDTO) {
        Group group = groupRepository.findById(lessonDTO.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid group ID"));

        Lesson lesson = entityMapper.dtoToLesson(lessonDTO);
        lesson.setGroup(group);
        lessonRepository.saveAndFlush(lesson);
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
                .map(entityMapper::lessonToDto)
                .collect(Collectors.toList());
    }


    public List<LessonDTO> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(entityMapper::lessonToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateAttendanceStatus(Long childId, Long lessonId, boolean attended) {
        System.out.println("Updating attendance for childId: " + childId + ", lessonId: " + lessonId + ", attended: " + attended);
        Attendance attendance = attendanceRepository.findByChildIdAndLessonId(childId, lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found for childId: " + childId + ", lessonId: " + lessonId));
        attendance.setStatus(attended ? AttendanceStatus.ATTENDED : AttendanceStatus.NOT_ATTENDED);
        attendanceRepository.saveAndFlush(attendance);
        System.out.println("Attendance status updated successfully for childId: " + childId + ", lessonId: " + lessonId);
    }



}