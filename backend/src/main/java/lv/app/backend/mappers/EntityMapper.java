package lv.app.backend.mappers;

import lv.app.backend.dto.*;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.enums.AttendanceStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = "spring")
public interface EntityMapper {

    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "kindergartenId", source = "group.kindergarten.id")
    ChildDTO childToDto(Child child);

    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "groupName", source = "group.name")
    @Mapping(target = "kindergartenName", source = "group.kindergarten.name")
    LessonDTO lessonToDto(Lesson lesson);

    @Mapping(target = "group.id", source = "groupId")
    @Mapping(target = "attendances", ignore = true)
    Lesson dtoToLesson(LessonDTO lessonDTO);

    @Mapping(target = "childId", source = "child.id")
    @Mapping(target = "lessonId", source = "lesson.id")
    @Mapping(target = "attended", source = "status", qualifiedByName = "mapAttendanceStatusToBoolean")
    @Mapping(target = "date", source = "lesson.date")
    AttendanceDTO attendanceToDto(Attendance attendance);


    @Mapping(target = "child.id", source = "childId")
    @Mapping(target = "lesson.id", source = "lessonId")
    @Mapping(target = "status", source = "attended", qualifiedByName = "mapBooleanToAttendanceStatus")
    Attendance dtoToAttendance(AttendanceDTO attendanceDTO);


    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", source = "user.fullName")
    InvoiceDTO invoiceToDto(Invoice invoice);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    Invoice dtoToInvoice(InvoiceCreateDTO invoice);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "group", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    Child updateChild(@MappingTarget Child child, ChildDTO childDTO);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    void updateInvoice(@MappingTarget Invoice invoice, InvoiceDTO dto);

    @Mapping(target = "group", ignore = true)
    @Mapping(target = "attendances", ignore = true)
    void updateLesson(@MappingTarget Lesson lesson, LessonDTO dto);

    @Named("mapAttendanceStatusToBoolean")
    default boolean mapAttendanceStatusToBoolean(AttendanceStatus status) {
        return AttendanceStatus.ATTENDED.equals(status);
    }

    @Named("mapBooleanToAttendanceStatus")
    default AttendanceStatus mapBooleanToAttendanceStatus(boolean attended) {
        return attended ? AttendanceStatus.ATTENDED : AttendanceStatus.NOT_ATTENDED;
    }
}
