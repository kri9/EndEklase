package lv.app.backend.service.invoice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.invoice.FullInvoiceDTO;
import lv.app.backend.dto.invoice.InvoiceDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceSavingService {

    private final EntityMapper entityMapper;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;
    private final AttendanceRepository attendanceRepository;
    private final InvoiceAmountCalculator invoiceAmountCalculator;

    @Transactional
    public List<Invoice> saveInvoiceDTOs(List<FullInvoiceDTO> invoices) {
        return invoices.stream().map(i -> {
            List<Attendance> attendances = attendanceRepository.findAllById(i.getAttendanceIds());
            Invoice createdInvoice = invoiceRepository.saveAndFlush(Invoice.builder()
                    .user(userRepository.getReferenceById(i.getUserId()))
                    .dueDate(i.getDueDate())
                    .dateIssued(i.getDateIssued())
                    .attendances(attendances)
                    .amount(i.getAmount() != null ? i.getAmount() : invoiceAmountCalculator.calculateInvoiceAmount(attendances))
                    .status(i.getStatus())
                    .build());
            attendances.forEach(a -> {
                a.setInvoice(createdInvoice);
                attendanceRepository.saveAndFlush(a);
            });
            log.trace("Created invoice with ID {}: {}", createdInvoice.getId(), createdInvoice);
            return createdInvoice;
        }).toList();
    }

    @Transactional
    public void updateInvoice(FullInvoiceDTO dto) {
        Invoice invoice = invoiceRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        entityMapper.updateInvoiceFull(invoice, dto);
        if (dto.getUserId() != null) {
            invoice.setUser(userRepository.getReferenceById(dto.getUserId()));
        }
        invoiceRepository.save(invoice);
    }
}
