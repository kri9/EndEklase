package lv.app.backend.model.repository;

import lv.app.backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserId(Long userId);

    Invoice findByUuid(UUID uuid);
}
