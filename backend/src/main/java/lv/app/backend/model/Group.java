package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@SoftDelete
@ToString(of = {"id"})
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "kindergarten_id")
    private Kindergarten kindergarten;
    @OneToMany(mappedBy = "group")
    private List<Child> children = new ArrayList<>();
    @OneToMany(mappedBy = "group")
    private List<Lesson> lessons = new ArrayList<>();
    private String name;
    private String description;
}