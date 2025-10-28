package lv.app.backend.service.invoice;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.service.PDFInvoiceGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceEmailService {

    private final InvoiceRepository invoiceRepository;
    private final PDFInvoiceGenerator pdfInvoiceGenerator;
    private final JavaMailSender mailSender;

    @Value("${mail.from:funnyenglish.eu@gmail.com}")
    private String fromAddress;

    @Transactional
    public Result sendByIssueDate(LocalDate issueDate, boolean unsentOnly) {
        List<Invoice> invoices = invoiceRepository.findByIssueDate(issueDate, unsentOnly);
        int ok = 0, fail = 0;

        for (Invoice inv : invoices) {
            try {
                if (inv.getUser() == null || inv.getUser().getUsername() == null) {
                    log.warn("Skip invoice {}: no user or user email", inv.getId());
                    fail++;
                    continue;
                }

                InputStream pdf = pdfInvoiceGenerator.generateInvoiceAdmin(inv.getId());

                MimeMessage msg = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
                helper.setFrom(fromAddress);
                helper.setTo(inv.getUser().getUsername());
                helper.setSubject("Rēķins #" + inv.getId());
                helper.setText(buildBody(inv), false);
                helper.addAttachment(
                        "invoice_" + inv.getId() + ".pdf",
                        new ByteArrayResource(pdf.readAllBytes()),
                        "application/pdf"
                );

                mailSender.send(msg);

                inv.setEmailedAt(LocalDateTime.now());
                invoiceRepository.save(inv);

                ok++;
                log.info("Invoice {} emailed to {}", inv.getId(), inv.getUser().getUsername());
            } catch (Exception e) {
                fail++;
                log.error("Failed to email invoice {}: {}", inv.getId(), e.getMessage(), e);
            }
        }
        return new Result(ok, fail, invoices.size());
    }

    private String buildBody(Invoice inv) {
        return """
                Labdien, %s!
                
                Pielikumā Jūsu rēķins #%d par stundu apmeklējumiem.
                Maksājuma termiņš: %s
                Summa: €%s
                
                Paldies!
                """.formatted(
                inv.getUser() != null ? inv.getUser().getFullName() : "",
                inv.getId(),
                inv.getDueDate(),
                inv.getAmount() != null ? inv.getAmount() : 0
        );
    }

    public record Result(int sent, int failed, int total) {
    }
}
