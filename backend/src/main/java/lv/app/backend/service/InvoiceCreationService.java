package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.InvoiceCreateDto;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceCreationService {

    @Value("${lesson-attendance-cost}")
    private Long cost;

    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public void createInvoice(InvoiceCreateDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + dto.getUserId()));
        List<Attendance> attendancesToPay = user.getChildren().stream()
                .flatMap(c -> c.getAttendances().stream())
                .filter(a -> a.isAttended() && dto.getLessonIds().contains(a.getLesson().getId()))
                .toList();
        LocalDate currentDate = LocalDate.now();
        invoiceRepository.save(Invoice.builder()
                .attendances(attendancesToPay)
                .amount(attendancesToPay.size() * cost) // Not taking discounts into account for now
                .dateIssued(currentDate)
                .dueDate(currentDate.plusWeeks(2))
                .user(user)
                .build());
    }
}
