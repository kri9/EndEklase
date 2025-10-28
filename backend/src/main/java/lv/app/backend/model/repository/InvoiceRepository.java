package lv.app.backend.model.repository;

import lv.app.backend.model.Invoice;
import lv.app.backend.model.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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
          and i.dateIssued >= coalesce(:start, i.dateIssued)
          and i.dateIssued <  coalesce(:end,   i.dateIssued)
        order by i.id
    """)
    List<Invoice> searchByFilters(
            @Param("kgId") Long kindergartenId,
            @Param("groupId") Long groupId,
            @Param("status") InvoiceStatus status,
            @Param("start") LocalDate startInclusive,
            @Param("end") LocalDate endExclusive
    );

    @Query("""
              select i from Invoice i
              where i.dateIssued = :issueDate
                and (:unsentOnly = false or i.emailedAt is null)
              order by i.id
            """)
    List<Invoice> findByIssueDate(
            @Param("issueDate") LocalDate issueDate,
            @Param("unsentOnly") boolean unsentOnly);

}
