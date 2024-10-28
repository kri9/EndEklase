package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.InvoiceCreateDTO;
import lv.app.backend.dto.InvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static lv.app.backend.util.Common.flatten;

@Service
@RequiredArgsConstructor
public class InvoiceCreationService {

    @Value("${lesson-attendance-cost}")
    private Long cost;

    private final EntityMapper entityMapper;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public void createInvoice(InvoiceCreateDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + dto.getUserId()));
        if (dto.getAmount() != null) {
            createManualInvoice(dto, user);
            return;
        }
        if (user.isSeparateInvoices()) {
            Supplier<Double> costRateGenerator = getCostRateGenerator();
            user.getChildren().forEach(c -> makeInvoice(c, dto.getLessonIds(), costRateGenerator));
            return;
        }
        makeSingleInvoice(dto, user);
    }

    @Transactional
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(entityMapper::invoiceToDto)
                .collect(Collectors.toList());
    }



    private void createManualInvoice(InvoiceCreateDTO dto, User user) {
        Invoice invoice = entityMapper.dtoToInvoice(dto);
        invoice.setUser(user);
        invoiceRepository.saveAndFlush(invoice);
    }

    private void makeSingleInvoice(InvoiceCreateDTO dto, User user) {
        Supplier<Double> costRateGenerator = getCostRateGenerator();
        List<List<Attendance>> attendancesToPay = user.getChildren().stream()
                .map(c -> getAttendancesToPay(c, dto.getLessonIds()))
                .toList();
        long sum = attendancesToPay.stream()
                .mapToLong(ats -> getCost(ats, costRateGenerator))
                .sum();
        formInvoice(sum, user, flatten(attendancesToPay));
    }

    private long getCost(List<Attendance> ats, Supplier<Double> costRateGenerator) {
        return Math.round(ats.size() * cost * costRateGenerator.get());
    }

    private void makeInvoice(Child c, List<Long> lessonsToPay, Supplier<Double> costRateGenerator) {
        List<Attendance> attendancesToPay = getAttendancesToPay(c, lessonsToPay);
        long round = getCost(attendancesToPay, costRateGenerator);
        formInvoice(round, c.getParent(), attendancesToPay);
    }

    private List<Attendance> getAttendancesToPay(Child child, List<Long> lessonsToPay) {
        return child.getAttendances().stream()
                .filter(a -> a.isAttended() && lessonsToPay.contains(a.getLesson().getId()))
                .toList();
    }

    private void formInvoice(Long invoiceAmount, User user, List<Attendance> attendancesToPay) {
        LocalDate currentDate = LocalDate.now();
        invoiceRepository.save(Invoice.builder()
                .attendances(attendancesToPay)
                .amount(invoiceAmount)
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
