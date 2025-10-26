package lv.app.backend.dto.invoice;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Value;
import lv.app.backend.model.enums.InvoiceStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Value
@Builder
@AllArgsConstructor
@NoArgsConstructor(force = true)
public class FullInvoiceDTO {
    Long id;
    Long userId;
    String userFullName;
    LocalDate dateIssued;
    LocalDate dueDate;
    Long amount;
    InvoiceStatus status;
    @Builder.Default
    @JsonAlias("attendances")
    @JsonProperty("attendances")
    List<Long> attendanceIds = new ArrayList<>();
}
