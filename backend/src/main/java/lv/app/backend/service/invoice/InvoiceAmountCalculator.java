package lv.app.backend.service.invoice;

import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.enums.AttendanceStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class InvoiceAmountCalculator {

    @Value("${lesson-attendance-cost}")
    private Long lessonCost;

    public Long calculateInvoiceAmount(List<Attendance> attendances) {
        Map<Child, List<Attendance>> attendancesToPay = attendances.stream()
                .filter(attendance -> attendance.getChild() != null)
                .filter(attendance -> AttendanceStatus.ATTENDED.equals(attendance.getStatus()))
                .collect(Collectors.groupingBy(Attendance::getChild));
        if (attendancesToPay.isEmpty()) {
            return 0L;
        }
        Function<Child, Double> costGenerator = getCostRateGenerator();
        return attendancesToPay.entrySet().stream()
                .mapToLong(e -> {
                    Double childRate = costGenerator.apply(e.getKey());
                    return BigDecimal.valueOf(e.getValue().size())
                            .multiply(BigDecimal.valueOf(lessonCost))
                            .multiply(BigDecimal.valueOf(childRate))
                            .setScale(0, RoundingMode.HALF_UP)
                            .longValue();
                }).sum();
    }

    private Function<Child, Double> getCostRateGenerator() {
        AtomicInteger call = new AtomicInteger();
        Set<Child> children = new HashSet<>();
        return c -> {
            if (children.contains(c)) {
                throw new RuntimeException("Duplicate child given");
            }
            children.add(c);
            int callNum = call.incrementAndGet();
            if (callNum == 1) {
                return 1.; // First child - full rate
            }
            if (callNum == 2) {
                return 0.5; // Second child - 0.5 rate
            }
            if (callNum == 3) {
                return 0.5; // third child - 0.5 rate
            }
            return 1.; // Other children full rate
        };
    }
}
