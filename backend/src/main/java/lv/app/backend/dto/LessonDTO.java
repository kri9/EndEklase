package lv.app.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
@AllArgsConstructor
@NoArgsConstructor(force = true)
public class LessonDTO {
    Long id;
    String topic;
    String notes;
    LocalDate date;
    Long groupId;
    String groupName;
    String kindergartenName;
    Boolean isLockedForEditing;
    Integer numOfAttendees;
}