package lv.app.backend.model.repository;

import lv.app.backend.model.Invoice;
import lv.app.backend.model.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserId(Long userId);

    Invoice findByUuid(UUID uuid);

    @Query("""
        select distinct i
        from Invoice i
        join i.attendances a
        join a.lesson l
        join l.group g
        join g.kindergarten k
        where (:kgId is null or k.id = :kgId)
          and (:groupId is null or g.id = :groupId)
          and (:status is null or i.status = :status)
        order by i.id
    """)
    List<Invoice> searchByFilters(
            @Param("kgId") Long kindergartenId,
            @Param("groupId") Long groupId,
            @Param("status") InvoiceStatus status
    );
}
