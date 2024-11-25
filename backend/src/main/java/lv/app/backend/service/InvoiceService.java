package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.InvoiceCreateDTO;
import lv.app.backend.dto.InvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.model.repository.LessonRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static lv.app.backend.util.Common.flatten;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final AttendanceRepository attendanceRepository;
    @Value("${lesson-attendance-cost}")
    private Long cost;

    private final EntityMapper entityMapper;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public void updateInvoice(InvoiceDTO dto) {
        Invoice invoice = invoiceRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        entityMapper.updateInvoice(invoice, dto);
        if (dto.getUserId() != null) {
            invoice.setUser(userRepository.getReferenceById(dto.getUserId()));
        }
        invoiceRepository.save(invoice);
    }

    @Transactional
    public void createInvoices(LocalDate startDate, LocalDate endDate) {
        List<User> users = userRepository.findAll();
        users.forEach(u -> {
            List<Long> lessons = lessonRepository.findUserLessonsToPay(startDate, endDate, u);
            if (lessons.isEmpty()) {
                log.error("No lessons to pay for user {}", u);
                return;
            }
            this.createInvoice(InvoiceCreateDTO.builder()
                    .userId(u.getId())
                    .lessonIds(lessons)
                    .build());
        });
    }

    @Transactional
    public void createInvoice(InvoiceCreateDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + dto.getUserId()));
        if (dto.getAmount() != null) {
            createManualInvoice(dto, user);
            return;
        }
        if (!user.isSeparateInvoices()) {
            makeSingleInvoice(dto, user);
            return;
        }
        Supplier<Double> costRateGenerator = getCostRateGenerator(user);
        user.getChildren().forEach(c -> {
            List<Attendance> attendancesToPay = getAttendancesToPay(c, dto.getLessonIds());
            setAttendanceCost(attendancesToPay, costRateGenerator, user);
            formInvoice(c.getParent(), attendancesToPay);
        });
    }

    @Transactional
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(entityMapper::invoiceToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<InvoiceDTO> getInvoicesByUser(Long userId) {
        List<Invoice> invoices = invoiceRepository.findByUserId(userId);
        return invoices.stream()
                .map(entityMapper::invoiceToDto)
                .collect(Collectors.toList());
    }

    private void createManualInvoice(InvoiceCreateDTO dto, User user) {
        Invoice invoice = entityMapper.dtoToInvoice(dto);
        invoice.setUser(user);
        List<Attendance> coveredAttendances = dto.getLessonIds().stream()
                .map(lessonRepository::getReferenceById)
                .flatMap(l -> l.getAttendances().stream())
                .filter(a -> user.getChildren().contains(a.getChild()) && a.isAttended() && a.getInvoice() == null)
                .toList();
        coveredAttendances.forEach(a -> a.setInvoice(invoice));
        invoice.setAttendances(coveredAttendances);
        invoiceRepository.saveAndFlush(invoice);
        log.trace("Created manual invoice: {}", invoice);
    }

    private void makeSingleInvoice(InvoiceCreateDTO dto, User user) {
        Supplier<Double> costRateGenerator = getCostRateGenerator(user);
        List<List<Attendance>> attendancesToPay = user.getChildren().stream()
                .map(c -> getAttendancesToPay(c, dto.getLessonIds()))
                .toList();
        attendancesToPay.forEach(ats -> setAttendanceCost(ats, costRateGenerator, user));
        formInvoice(user, flatten(attendancesToPay));
    }

    private void setAttendanceCost(List<Attendance> ats, Supplier<Double> costRateGenerator, User user) {
        double discountRate = getDiscountRate(user);
        ats.forEach(a -> a.setCost(Math.round(cost * costRateGenerator.get() * discountRate)));
    }

    private double getDiscountRate(User user) {
        if (user.getDiscountRate() == null) {
            return 1;
        }
        return (100 - user.getDiscountRate()) / 100;
    }

    private List<Attendance> getAttendancesToPay(Child child, List<Long> lessonsToPay) {
        return child.getAttendances().stream()
                .filter(a -> a.isAttended() && lessonsToPay.contains(a.getLesson().getId()))
                .toList();
    }

    private void formInvoice(User user, List<Attendance> attendancesToPay) {
        if (attendancesToPay.isEmpty()) {
            log.trace("No attendances to pay for user {}", user);
            return;
        }
        long invoiceAmount = attendancesToPay.stream()
                .mapToLong(Attendance::getCost)
                .sum();
        LocalDate currentDate = LocalDate.now();
        Invoice savedInvoice = invoiceRepository.save(Invoice.builder()
                .attendances(attendancesToPay)
                .amount(invoiceAmount)
                .dateIssued(currentDate)
                .dueDate(currentDate.plusWeeks(2))
                .user(user)
                .build());
        log.trace("Created invoice: {}", savedInvoice);
        attendancesToPay.forEach(a -> {
            a.setInvoice(savedInvoice);
            attendanceRepository.save(a);
        });
    }

    private Supplier<Double> getCostRateGenerator(User user) {
        AtomicInteger call = new AtomicInteger();
        if (user.getChildren().size() <= 1) {
            return () -> 1.;
        }
        return () -> {
            int callNum = call.incrementAndGet();
            if (callNum == 1) return 1.; // First child - full rate
            if (callNum == 2) return 0.5; // Second child - 0.5 rate
            if (callNum == 3) return 0.5; // third child - 0.5 rate
            return 1.; // Other children full rate
        };
    }

}
