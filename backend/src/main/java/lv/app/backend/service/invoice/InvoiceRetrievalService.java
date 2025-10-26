package lv.app.backend.service.invoice;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.invoice.FullInvoiceDTO;
import lv.app.backend.dto.invoice.InvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.enums.InvoiceStatus;
import lv.app.backend.model.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceRetrievalService {

    private final EntityMapper entityMapper;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public List<FullInvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(entityMapper::invoiceToFullDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<FullInvoiceDTO> getAllFullInvoices() {
        return invoiceRepository.findAll().stream()
                .map(entityMapper::invoiceToFullDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FullInvoiceDTO getInvoiceById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .map(entityMapper::invoiceToFullDTO)
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
    public List<FullInvoiceDTO> searchInvoices(Long kindergartenId, Long groupId, InvoiceStatus status) {
                return searchInvoices(kindergartenId, groupId, status, null, null);
            }

    @Transactional
    public List<FullInvoiceDTO> searchInvoices(Long kindergartenId, Long groupId, InvoiceStatus status,
                                               LocalDate startInclusive, LocalDate endExclusive) {
                        if (kindergartenId == null && groupId == null && status == null
                                && startInclusive == null && endExclusive == null) {
                        return getAllInvoices();
                    }
                return invoiceRepository.searchByFilters(kindergartenId, groupId, status, startInclusive, endExclusive)
                                .stream()
                                .map(entityMapper::invoiceToFullDTO)
                                .toList();
            }

}
