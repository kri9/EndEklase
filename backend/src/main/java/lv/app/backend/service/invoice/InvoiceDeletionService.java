package lv.app.backend.service.invoice;

import lombok.RequiredArgsConstructor;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.repository.InvoiceRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class InvoiceDeletionService {

    public final InvoiceRepository invoiceRepository;

    @Transactional
    public void deleteInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        invoiceRepository.delete(invoice);
    }

}
