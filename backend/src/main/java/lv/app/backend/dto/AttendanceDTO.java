package lv.app.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long childId;
    private Long lessonId;
    private boolean attended;
    private LessonDTO lesson;
}
