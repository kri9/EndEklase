package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lv.app.backend.common.IdSupplier;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@ToString(of = {"id"})
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "children")
public class Child implements IdSupplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    @OneToMany(mappedBy = "child")
    private List<Attendance> attendances = new ArrayList<>();
    private String lastname;
    private String firstname;

    public List<Lesson> getAttendedLessons() {
        return getAttendances().stream()
                .filter(Attendance::isAttended)
                .map(Attendance::getLesson)
                .toList();
    }
}
