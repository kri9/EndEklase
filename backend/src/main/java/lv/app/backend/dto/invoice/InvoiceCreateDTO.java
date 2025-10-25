package lv.app.backend.dto.invoice;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Builder;
import lombok.Value;
import lv.app.backend.model.enums.InvoiceStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Value
@Builder
public class InvoiceCreateDTO {
    Long userId;
    LocalDate dateIssued;
    LocalDate dueDate;
    Long amount;
    InvoiceStatus status;
    @Builder.Default
    @JsonAlias("attendances")
    List<Long> attendanceIds = new ArrayList<>();
}
