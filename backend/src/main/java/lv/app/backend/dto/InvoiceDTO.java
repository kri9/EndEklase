package lv.app.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Value;
import lv.app.backend.model.enums.InvoiceStatus;

import java.time.LocalDate;

@Value
@Builder
@AllArgsConstructor
@NoArgsConstructor(force = true)
public class InvoiceDTO {
    Long id;
    Long userId;
    String userFullName;
    LocalDate dateIssued;
    LocalDate dueDate;
    Long amount;
    InvoiceStatus status;
}