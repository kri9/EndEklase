package lv.app.backend.service.invoice;

import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.enums.AttendanceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class InvoiceAmountCalculatorTest {

    private InvoiceAmountCalculator invoiceAmountCalculator;

    @BeforeEach
    public void setUp() {
        invoiceAmountCalculator = new InvoiceAmountCalculator(300L);
    }

    @Test
    void calculateInvoiceAmount() {
        Child child1 = new Child() {{setId(1L);}};
        Child child2 = new Child() {{setId(2L);}};
        Attendance at1 = createAttendance(child1);
        Attendance at2 = createAttendance(child1);
        Attendance at3 = createAttendance(child1);
        Attendance at4 = createAttendance(child2);
        Attendance at5 = createAttendance(child2);
        List<Attendance> ats = Arrays.asList(at1, at2, at3, at4, at5);
        assertThat(invoiceAmountCalculator.calculateInvoiceAmount(ats)).isEqualTo(1200L);
        assertThat(at1.getCost()).isEqualTo(300L);
        assertThat(at2.getCost()).isEqualTo(300L);
        assertThat(at3.getCost()).isEqualTo(300L);
        assertThat(at4.getCost()).isEqualTo(150);
        assertThat(at5.getCost()).isEqualTo(150L);

    }

    private Attendance createAttendance(Child child) {
        Attendance attendance = new Attendance();
        attendance.setChild(child);
        attendance.setStatus(AttendanceStatus.ATTENDED);
        return attendance;
    }

}