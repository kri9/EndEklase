package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Group;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.repository.GroupRepository;
import lv.app.backend.model.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final GroupRepository groupRepository;
    private final EntityMapper entityMapper;

    public void saveLesson(LessonDTO lessonDTO) {
        Group group = groupRepository.findById(lessonDTO.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid group ID"));

        Lesson lesson = entityMapper.dtoToLesson(lessonDTO);
        lesson.setGroup(group);

        lessonRepository.saveAndFlush(lesson);
    }



    public List<LessonDTO> getLessonsByGroup(Long groupId) {
        List<Lesson> lessons = lessonRepository.findByGroupId(groupId);
        System.out.println("Fetched Lessons for Group ID " + groupId + ": " + lessons);
        return lessons.stream()
                .map(lesson -> LessonDTO.builder()
                        .id(lesson.getId())
                        .topic(lesson.getTopic())
                        .date(lesson.getDate())
                        .notes(lesson.getNotes())
                        .groupId(lesson.getGroup().getId())
                        .build())
                .collect(Collectors.toList());
    }


    public List<LessonDTO> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(entityMapper::lessonToDto)
                .collect(Collectors.toList());
    }

}