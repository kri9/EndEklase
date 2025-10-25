package lv.app.backend.service.invoice;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.invoice.InvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.enums.InvoiceStatus;
import lv.app.backend.model.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceRetrievalService {

    private final EntityMapper entityMapper;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(entityMapper::invoiceToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceDTO getInvoiceById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .map(entityMapper::invoiceToDto)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
    }

    @Transactional
    public List<InvoiceDTO> getInvoicesByUser(Long userId) {
        List<Invoice> invoices = invoiceRepository.findByUserId(userId);
        return invoices.stream()
                .map(entityMapper::invoiceToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<InvoiceDTO> searchInvoices(Long kindergartenId, Long groupId, InvoiceStatus status) {
        if (kindergartenId == null && groupId == null && status == null) {
            return getAllInvoices();
        }
        return invoiceRepository.searchByFilters(kindergartenId, groupId, status)
                .stream()
                .map(entityMapper::invoiceToDto)
                .toList();
    }

}
