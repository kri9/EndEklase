package lv.app.backend.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import lv.app.backend.model.enums.InvoiceStatus;
import org.hibernate.annotations.SoftDelete;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@SoftDelete
@ToString(of = {"id"})
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "invoice", uniqueConstraints = {
        @UniqueConstraint(columnNames = "uuid")
})
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Builder.Default
    private UUID uuid = UUID.randomUUID();
    @ManyToOne(optional = true)
    @Nullable
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
