package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class LessonDTO {
    Long id;
    String topic;
    String notes;
    LocalDate date;
    Long groupId;
    String groupName;
    String kindergartenName;
}