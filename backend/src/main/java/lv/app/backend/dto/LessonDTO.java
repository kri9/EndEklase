package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder

public class LessonDTO {
    private Long id;
    private String topic;
    private String notes;
    private LocalDate date;
    private Long groupId;
}