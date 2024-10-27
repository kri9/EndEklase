package lv.app.backend.mappers;

import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.ChildDTO;
import lv.app.backend.dto.InvoiceCreateDTO;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.enums.AttendanceStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
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
    Lesson dtoToLesson(LessonDTO lessonDTO);

    @Mapping(target = "childId", source = "child.id")
    @Mapping(target = "lessonId", source = "lesson.id")
    @Mapping(target = "attended", source = "status", qualifiedByName = "mapAttendanceStatusToBoolean")
    AttendanceDTO attendanceToDto(Attendance attendance);

    @Mapping(target = "child.id", source = "childId")
    @Mapping(target = "lesson.id", source = "lessonId")
    @Mapping(target = "status", source = "attended", qualifiedByName = "mapBooleanToAttendanceStatus")
    Attendance dtoToAttendance(AttendanceDTO attendanceDTO);

    Invoice dtoToInvoice(InvoiceCreateDTO invoice);

    @Named("mapAttendanceStatusToBoolean")
    default boolean mapAttendanceStatusToBoolean(AttendanceStatus status) {
        return AttendanceStatus.ATTENDED.equals(status);
    }

    @Named("mapBooleanToAttendanceStatus")
    default AttendanceStatus mapBooleanToAttendanceStatus(boolean attended) {
        return attended ? AttendanceStatus.ATTENDED : AttendanceStatus.NOT_ATTENDED;
    }
}
