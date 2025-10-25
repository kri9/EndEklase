package lv.app.backend.mappers;

import javax.annotation.processing.Generated;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.model.Group;
import lv.app.backend.model.Kindergarten;
import lv.app.backend.model.Lesson;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-25T17:16:42+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 21.0.6 (Amazon.com Inc.)"
)
@Component
public class LessonMapperImpl implements LessonMapper {

    @Override
    public LessonDTO lessonToDto(Lesson lesson) {
        if ( lesson == null ) {
            return null;
        }

        LessonDTO.LessonDTOBuilder lessonDTO = LessonDTO.builder();

        lessonDTO.groupId( lessonGroupId( lesson ) );
        lessonDTO.groupName( lessonGroupName( lesson ) );
        lessonDTO.kindergartenName( lessonGroupKindergartenName( lesson ) );
        lessonDTO.isLockedForEditing( isLockedForEditing( lesson ) );
        lessonDTO.numOfAttendees( getNumOfAttendees( lesson ) );
        lessonDTO.id( lesson.getId() );
        lessonDTO.topic( lesson.getTopic() );
        lessonDTO.notes( lesson.getNotes() );
        lessonDTO.date( lesson.getDate() );

        return lessonDTO.build();
    }

    @Override
    public Lesson dtoToLesson(LessonDTO lessonDTO) {
        if ( lessonDTO == null ) {
            return null;
        }

        Lesson.LessonBuilder lesson = Lesson.builder();

        lesson.group( lessonDTOToGroup( lessonDTO ) );
        lesson.id( lessonDTO.getId() );
        lesson.topic( lessonDTO.getTopic() );
        lesson.notes( lessonDTO.getNotes() );
        lesson.date( lessonDTO.getDate() );

        return lesson.build();
    }

    @Override
    public void updateLesson(Lesson lesson, LessonDTO dto) {
        if ( dto == null ) {
            return;
        }

        lesson.setId( dto.getId() );
        lesson.setTopic( dto.getTopic() );
        lesson.setNotes( dto.getNotes() );
        lesson.setDate( dto.getDate() );
    }

    private Long lessonGroupId(Lesson lesson) {
        Group group = lesson.getGroup();
        if ( group == null ) {
            return null;
        }
        return group.getId();
    }

    private String lessonGroupName(Lesson lesson) {
        Group group = lesson.getGroup();
        if ( group == null ) {
            return null;
        }
        return group.getName();
    }

    private String lessonGroupKindergartenName(Lesson lesson) {
        Group group = lesson.getGroup();
        if ( group == null ) {
            return null;
        }
        Kindergarten kindergarten = group.getKindergarten();
        if ( kindergarten == null ) {
            return null;
        }
        return kindergarten.getName();
    }

    protected Group lessonDTOToGroup(LessonDTO lessonDTO) {
        if ( lessonDTO == null ) {
            return null;
        }

        Group.GroupBuilder group = Group.builder();

        group.id( lessonDTO.getGroupId() );

        return group.build();
    }
}
