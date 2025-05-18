package lv.app.backend.service;

import lombok.SneakyThrows;
import lv.app.backend.dto.InvoiceCreateDTO;
import lv.app.backend.dto.InvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.*;
import lv.app.backend.model.enums.AttendanceStatus;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.model.repository.LessonRepository;
import lv.app.backend.model.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private EntityMapper entityMapper;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LessonRepository lessonRepository;
    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private InvoiceService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "cost", 50L);
    }

    @Test
    void updateInvoice_updatesMappedFields_andPersists() {
        // given
        long invoiceId = 1L;
        long newUserId = 99L;

        InvoiceDTO dto = InvoiceDTO.builder()
                .id(invoiceId)
                .userId(newUserId)
                .build();

        Invoice existingInvoice = new Invoice();
        User newUser = new User();

        when(invoiceRepository.findById(invoiceId))
                .thenReturn(Optional.of(existingInvoice));
        when(userRepository.getReferenceById(newUserId))
                .thenReturn(newUser);

        // when
        service.updateInvoice(dto);

        // then
        verify(entityMapper).updateInvoice(existingInvoice, dto);
        assertThat(existingInvoice.getUser()).isSameAs(newUser);
        verify(invoiceRepository).save(existingInvoice);
        verifyNoMoreInteractions(invoiceRepository, userRepository, entityMapper);
    }

    @Test
    void deleteInvoice_happyPath_deletesInvoice() {
        // given
        long invoiceId = 42L;
        Invoice invoice = new Invoice();
        when(invoiceRepository.findById(invoiceId))
                .thenReturn(Optional.of(invoice));

        // when
        service.deleteInvoice(invoiceId);

        // then
        verify(invoiceRepository).delete(invoice);
    }

    @Test
    @SneakyThrows
    void createInvoice_withManualAmount_createsManualInvoice_andLinksAttendance() {
        // ----------  GIVEN ----------
        long userId = 7L;
        long lessonId = 123L;

        InvoiceCreateDTO dto = InvoiceCreateDTO.builder()
                .userId(userId)
                .lessonIds(List.of(lessonId))
                .amount(2_000L)      // manual amount triggers the manual branch
                .build();

        // domain skeleton
        User user = new User();
        user.setId(userId);
        Child child = new Child();
        child.setParent(user);
        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        Attendance attendance = new Attendance();
        attendance.setChild(child);
        attendance.setLesson(lesson);
        attendance.setStatus(AttendanceStatus.ATTENDED);
        child.setAttendances(List.of(attendance));
        user.setChildren(List.of(child));
        lesson.setAttendances(List.of(attendance));

        // invoice mapping / persistence mocks
        Invoice tmpInvoice = new Invoice();      // entity returned by mapper
        Invoice savedInvoice = new Invoice();
        savedInvoice.setId(88L);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(lessonRepository.getReferenceById(lessonId)).thenReturn(lesson);
        when(entityMapper.dtoToInvoice(dto)).thenReturn(tmpInvoice);
        when(invoiceRepository.saveAndFlush(tmpInvoice)).thenReturn(savedInvoice);

        // ----------  WHEN  ----------
        List<Invoice> result = service.createInvoice(dto);

        // ----------  THEN ----------
        assertThat(result)
                .hasSize(1)
                .first()
                .isSameAs(savedInvoice);

        // attendance now linked to the just-saved invoice
        assertThat(attendance.getInvoice()).isSameAs(savedInvoice);

        verify(attendanceRepository).save(attendance);
        verify(invoiceRepository).saveAndFlush(tmpInvoice);
    }

}
