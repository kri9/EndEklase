package lv.app.backend.dto;

import lombok.Value;
import lv.app.backend.model.enums.InvoiceStatus;

import java.time.LocalDate;
import java.util.List;

@Value
public class InvoiceCreateDTO {
    Long userId;
    LocalDate dateIssued;
    LocalDate dueDate;
    Long amount;
    InvoiceStatus status;

    List<Long> lessonIds;
}
