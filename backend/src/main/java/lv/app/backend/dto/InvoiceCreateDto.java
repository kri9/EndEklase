package lv.app.backend.dto;

import lombok.Value;

import java.util.List;

@Value
public class InvoiceCreateDto {

    Long userId;
    List<Long> lessonIds;
}
