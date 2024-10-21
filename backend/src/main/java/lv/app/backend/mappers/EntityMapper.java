package lv.app.backend.mappers;

import lv.app.backend.dto.ChildDTO;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.model.Child;
import lv.app.backend.model.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = "spring")
public interface EntityMapper {

    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "kindergartenId", source = "group.kindergarten.id")
    ChildDTO childToDto(Child child);
    @Mapping(target = "groupId", source = "group.id")
    LessonDTO lessonToDto(Lesson lesson);

    @Mapping(target = "group.id", source = "groupId")
    @Mapping(target = "attendances", ignore = true)
    Lesson dtoToLesson(LessonDTO lessonDTO);}
