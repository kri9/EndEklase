package lv.app.backend.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import lv.app.backend.model.enums.AttendanceStatus;
import org.hibernate.annotations.SoftDelete;

@Getter
@Setter
@Entity
@Builder
@SoftDelete
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
    @Nullable
    @ManyToOne
    private Child child;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status = AttendanceStatus.NOT_ATTENDED;
    @ManyToOne
    private Invoice invoice;
    private Long cost;

    public boolean isAttended() {
        return AttendanceStatus.ATTENDED.equals(this.getStatus());
    }
    public boolean hasRelatedChild() {
        return getChild() != null;
    }
}
