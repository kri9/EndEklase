package lv.app.backend.mappers;

import lv.app.backend.dto.LessonDTO;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = "spring")
public interface LessonMapper {

    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "groupName", source = "group.name")
    @Mapping(target = "kindergartenName", source = "group.kindergarten.name")
    @Mapping(target = "isLockedForEditing", source = "lesson", qualifiedByName = "isLockedForEditing")
    @Mapping(target = "numOfAttendees", source = "lesson", qualifiedByName = "numOfAttendees")
    LessonDTO lessonToDto(Lesson lesson);

    @Mapping(target = "group.id", source = "groupId")
    @Mapping(target = "attendances", ignore = true)
    Lesson dtoToLesson(LessonDTO lessonDTO);

    @Mapping(target = "group", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    void updateLesson(@MappingTarget Lesson lesson, LessonDTO dto);

    @Named("isLockedForEditing")
    default boolean isLockedForEditing(Lesson lesson) {
        return lesson.getAttendances().stream()
                .anyMatch(a -> a.getInvoice() != null);
    }

    @Named("numOfAttendees")
    default int getNumOfAttendees(Lesson lesson) {
        return lesson.getAttendances().stream()
                .filter(Attendance::isAttended)
                .toList().size();
    }
}
