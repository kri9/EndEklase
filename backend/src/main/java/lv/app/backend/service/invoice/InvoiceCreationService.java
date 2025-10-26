package lv.app.backend.service.invoice;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.invoice.FullInvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.InvoiceStatus;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceCreationService {


    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final InvoiceAmountCalculator invoiceAmountCalculator;
    private final EntityMapper entityMapper;

    @Transactional
    public List<FullInvoiceDTO> createInvoiceDTOs(LocalDate startDate, LocalDate endDate) {
        List<User> users = userRepository.findAll();
        return users.stream()
                .flatMap(user -> createInvoiceForUser(startDate, endDate, user).stream())
                .filter(Objects::nonNull)
                .toList();
    }

    private List<FullInvoiceDTO> createInvoiceForUser(LocalDate startDate, LocalDate endDate, User user) {
        if (!user.isSeparateInvoices()) {
            return Collections.singletonList(createInvoiceForChildren(user.getChildren(), startDate, endDate));
        }
        return user.getChildren().stream()
                .map(child -> createInvoiceForChildren(Collections.singletonList(child), startDate, endDate))
                .filter(Objects::nonNull)
                .toList();
    }

    private FullInvoiceDTO createInvoiceForChildren(List<Child> children, LocalDate startDate, LocalDate endDate) {
        if (children.isEmpty()) {
            return null;
        }
        List<Attendance> attendances = attendanceRepository.findAttendanceToPayForChildren(startDate, endDate, children);
        LocalDate currentDate = LocalDate.now();
        return FullInvoiceDTO.builder()
                .status(InvoiceStatus.NOT_PAID)
                .userId(children.getFirst().getParent().getId())
                .amount(invoiceAmountCalculator.calculateInvoiceAmount(attendances))
                .dueDate(currentDate.plusWeeks(2))
                .dateIssued(currentDate)
                .attendanceIds(attendances.stream().map(Attendance::getId).distinct().toList())
                .build();
    }


}
