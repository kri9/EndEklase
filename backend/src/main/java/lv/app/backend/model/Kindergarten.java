package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;

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
@Table(name = "kindergartens")
public class Kindergarten {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String contactInfo;

    @OneToMany(mappedBy = "kindergarten")
    private List<Group> groups = new ArrayList<>();
}