package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lv.app.backend.model.enums.InvoiceStatus;
import org.hibernate.annotations.SoftDelete;

import java.time.LocalDate;
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
@Table(name = "invoice")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User user;
    @OneToMany(mappedBy = "invoice")
    private List<Attendance> attendances = new ArrayList<>();
    private LocalDate dateIssued;
    private LocalDate dueDate;
    private Long amount;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.NOT_PAID;
}
