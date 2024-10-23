package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.InvoiceCreateDto;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

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
        Supplier<Double> costRateGenerator = getCostRateGenerator();
        if (user.isSeparateInvoices()) {
            user.getChildren().forEach(c -> makeInvoice(c, dto.getLessonIds(), costRateGenerator));
            return;
        }
        List<Attendance> attendancesToPay = getAttendancesToPay(user.getChildren(), dto.getLessonIds());
        formInvoice(attendancesToPay, user, costRateGenerator);
    }

    private void makeInvoice(Child c, List<Long> lessonsToPay, Supplier<Double> costRateGenerator) {
        List<Attendance> attendancesToPay = getAttendancesToPay(List.of(c), lessonsToPay);
        formInvoice(attendancesToPay, c.getParent(), costRateGenerator);
    }

    private List<Attendance> getAttendancesToPay(Collection<Child> children, List<Long> lessonsToPay) {
        return children.stream()
                .flatMap(c -> c.getAttendances().stream())
                .filter(a -> a.isAttended() && lessonsToPay.contains(a.getLesson().getId()))
                .toList();
    }

    private void formInvoice(List<Attendance> attendancesToPay, User user, Supplier<Double> costRateGenerator) {
        LocalDate currentDate = LocalDate.now();
        invoiceRepository.save(Invoice.builder()
                .attendances(attendancesToPay)
                .amount(Math.round(attendancesToPay.size() * cost * costRateGenerator.get()))
                .dateIssued(currentDate)
                .dueDate(currentDate.plusWeeks(2))
                .user(user)
                .build());
    }

    private Supplier<Double> getCostRateGenerator() {
        AtomicInteger call = new AtomicInteger();
        return () -> {
            int callNum = call.incrementAndGet();
            if (callNum == 1) return 1.; // First child - full rate
            if (callNum == 2) return 0.8; // Second child - 0.8 rate
            return 1.; // Other children full rate
        };
    }

}
