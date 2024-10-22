package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lv.app.backend.model.enums.AttendanceStatus;

@Getter
@Setter
@Entity
@Builder
@ToString(of = {"id"})
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Lesson lesson;
    @ManyToOne
    private Child child;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status = AttendanceStatus.NOT_ATTENDED;
    @ManyToOne
    private Invoice invoice;


    public boolean isAttended() {
        return AttendanceStatus.ATTENDED.equals(this.getStatus());
    }
}
