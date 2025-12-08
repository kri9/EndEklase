package lv.app.backend.model.repository;

import lv.app.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    @Query("""
            select distinct u
            from User u
            join u.children c
            where lower(c.firstname) like lower(concat('%', :q, '%'))
               or lower(c.lastname)  like lower(concat('%', :q, '%'))
            """)
    List<User> searchByChildName(@Param("q") String q);

    @Query(value = """
            SELECT u.* 
            FROM users u
            JOIN invoice i ON i.user_id = u.id
            WHERE i.id = ?1
            """,
            nativeQuery = true)
    User findDeletedByInvoice(Long invoiceId);
}

