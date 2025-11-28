package lv.app.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lv.app.backend.model.enums.UserRole;
import org.hibernate.annotations.SoftDelete;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@SoftDelete
@ToString(of = {"id", "username"})
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"first_name", "last_name"})
})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private boolean separateInvoices;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;
    @Builder.Default
    @OneToMany(mappedBy = "parent", cascade = CascadeType.REMOVE)
    private List<Child> children = new ArrayList<>();
    @Builder.Default
    @OneToMany(mappedBy = "user")
    private List<Invoice> invoices = new ArrayList<>();
    private Double discountRate;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.getRole().prefixedRole()));
    }

    public String getFullName() {
        return getFirstName() + " " + getLastName();
    }
}