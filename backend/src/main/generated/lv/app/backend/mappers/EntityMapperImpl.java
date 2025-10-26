package lv.app.backend.mappers;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.ChildDTO;
import lv.app.backend.dto.LessonDTO;
import lv.app.backend.dto.invoice.FullInvoiceDTO;
import lv.app.backend.dto.invoice.InvoiceDTO;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Group;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.Kindergarten;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-26T14:36:20+0200",
    comments = "version: 1.6.2, compiler: javac, environment: Java 21.0.6 (Amazon.com Inc.)"
)
@Component
public class EntityMapperImpl implements EntityMapper {

    @Override
    public ChildDTO childToDto(Child child) {
        if ( child == null ) {
            return null;
        }

        ChildDTO.ChildDTOBuilder childDTO = ChildDTO.builder();

        childDTO.groupId( childGroupId( child ) );
        childDTO.kindergartenId( childGroupKindergartenId( child ) );
        childDTO.id( child.getId() );
        childDTO.firstname( child.getFirstname() );
        childDTO.lastname( child.getLastname() );

        return childDTO.build();
    }

    @Override
    public AttendanceDTO attendanceToDto(Attendance attendance) {
        if ( attendance == null ) {
            return null;
        }

        AttendanceDTO attendanceDTO = new AttendanceDTO();

        attendanceDTO.setId( attendance.getId() );
        attendanceDTO.setChildId( attendanceChildId( attendance ) );
        attendanceDTO.setLessonId( attendanceLessonId( attendance ) );
        attendanceDTO.setAttended( mapAttendanceStatusToBoolean( attendance.getStatus() ) );
        attendanceDTO.setDate( attendanceLessonDate( attendance ) );
        attendanceDTO.setLesson( lessonToLessonDTO( attendance.getLesson() ) );

        return attendanceDTO;
    }

    @Override
    public Attendance dtoToAttendance(AttendanceDTO attendanceDTO) {
        if ( attendanceDTO == null ) {
            return null;
        }

        Attendance.AttendanceBuilder attendance = Attendance.builder();

        attendance.child( attendanceDTOToChild( attendanceDTO ) );
        attendance.lesson( attendanceDTOToLesson( attendanceDTO ) );
        attendance.status( mapBooleanToAttendanceStatus( attendanceDTO.isAttended() ) );
        attendance.id( attendanceDTO.getId() );

        return attendance.build();
    }

    @Override
    public InvoiceDTO invoiceToDto(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }

        InvoiceDTO.InvoiceDTOBuilder invoiceDTO = InvoiceDTO.builder();

        invoiceDTO.userId( invoiceUserId( invoice ) );
        invoiceDTO.userFullName( invoiceUserFullName( invoice ) );
        invoiceDTO.id( invoice.getId() );
        invoiceDTO.dateIssued( invoice.getDateIssued() );
        invoiceDTO.dueDate( invoice.getDueDate() );
        invoiceDTO.paymentReceiveDate( invoice.getPaymentReceiveDate() );
        invoiceDTO.amount( invoice.getAmount() );
        invoiceDTO.status( invoice.getStatus() );

        return invoiceDTO.build();
    }

    @Override
    public FullInvoiceDTO invoiceToFullDTO(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }

        FullInvoiceDTO.FullInvoiceDTOBuilder fullInvoiceDTO = FullInvoiceDTO.builder();

        fullInvoiceDTO.id( invoice.getId() );
        fullInvoiceDTO.userId( invoiceUserId( invoice ) );
        fullInvoiceDTO.userFullName( invoiceUserFullName( invoice ) );
        fullInvoiceDTO.attendanceIds( attendanceListToLongList( invoice.getAttendances() ) );
        fullInvoiceDTO.dateIssued( invoice.getDateIssued() );
        fullInvoiceDTO.dueDate( invoice.getDueDate() );
        fullInvoiceDTO.amount( invoice.getAmount() );
        fullInvoiceDTO.status( invoice.getStatus() );

        return fullInvoiceDTO.build();
    }

    @Override
    public Invoice dtoToInvoice(FullInvoiceDTO invoice) {
        if ( invoice == null ) {
            return null;
        }

        Invoice.InvoiceBuilder invoice1 = Invoice.builder();

        invoice1.dateIssued( invoice.getDateIssued() );
        invoice1.dueDate( invoice.getDueDate() );
        invoice1.amount( invoice.getAmount() );
        invoice1.status( invoice.getStatus() );

        return invoice1.build();
    }

    @Override
    public Child updateChild(Child child, ChildDTO childDTO) {
        if ( childDTO == null ) {
            return child;
        }

        child.setId( childDTO.getId() );
        child.setLastname( childDTO.getLastname() );
        child.setFirstname( childDTO.getFirstname() );

        return child;
    }

    @Override
    public void updateInvoice(Invoice invoice, InvoiceDTO dto) {
        if ( dto == null ) {
            return;
        }

        invoice.setId( dto.getId() );
        invoice.setDateIssued( dto.getDateIssued() );
        invoice.setDueDate( dto.getDueDate() );
        invoice.setPaymentReceiveDate( dto.getPaymentReceiveDate() );
        invoice.setAmount( dto.getAmount() );
        invoice.setStatus( dto.getStatus() );
    }

    @Override
    public void updateInvoiceFull(Invoice invoice, FullInvoiceDTO dto) {
        if ( dto == null ) {
            return;
        }

        invoice.setId( dto.getId() );
        invoice.setDateIssued( dto.getDateIssued() );
        invoice.setDueDate( dto.getDueDate() );
        invoice.setAmount( dto.getAmount() );
        invoice.setStatus( dto.getStatus() );
    }

    private Long childGroupId(Child child) {
        Group group = child.getGroup();
        if ( group == null ) {
            return null;
        }
        return group.getId();
    }

    private Long childGroupKindergartenId(Child child) {
        Group group = child.getGroup();
        if ( group == null ) {
            return null;
        }
        Kindergarten kindergarten = group.getKindergarten();
        if ( kindergarten == null ) {
            return null;
        }
        return kindergarten.getId();
    }

    private Long attendanceChildId(Attendance attendance) {
        Child child = attendance.getChild();
        if ( child == null ) {
            return null;
        }
        return child.getId();
    }

    private Long attendanceLessonId(Attendance attendance) {
        Lesson lesson = attendance.getLesson();
        if ( lesson == null ) {
            return null;
        }
        return lesson.getId();
    }

    private LocalDate attendanceLessonDate(Attendance attendance) {
        Lesson lesson = attendance.getLesson();
        if ( lesson == null ) {
            return null;
        }
        return lesson.getDate();
    }

    protected LessonDTO lessonToLessonDTO(Lesson lesson) {
        if ( lesson == null ) {
            return null;
        }

        LessonDTO.LessonDTOBuilder lessonDTO = LessonDTO.builder();

        lessonDTO.id( lesson.getId() );
        lessonDTO.topic( lesson.getTopic() );
        lessonDTO.notes( lesson.getNotes() );
        lessonDTO.date( lesson.getDate() );

        return lessonDTO.build();
    }

    protected Child attendanceDTOToChild(AttendanceDTO attendanceDTO) {
        if ( attendanceDTO == null ) {
            return null;
        }

        Child.ChildBuilder child = Child.builder();

        child.id( attendanceDTO.getChildId() );

        return child.build();
    }

    protected Lesson attendanceDTOToLesson(AttendanceDTO attendanceDTO) {
        if ( attendanceDTO == null ) {
            return null;
        }

        Lesson.LessonBuilder lesson = Lesson.builder();

        lesson.id( attendanceDTO.getLessonId() );

        return lesson.build();
    }

    private Long invoiceUserId(Invoice invoice) {
        User user = invoice.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getId();
    }

    private String invoiceUserFullName(Invoice invoice) {
        User user = invoice.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getFullName();
    }

    protected List<Long> attendanceListToLongList(List<Attendance> list) {
        if ( list == null ) {
            return null;
        }

        List<Long> list1 = new ArrayList<Long>( list.size() );
        for ( Attendance attendance : list ) {
            list1.add( attendanceToLong( attendance ) );
        }

        return list1;
    }
}
