package lv.app.backend.service;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.ChildRepository;
import lv.app.backend.model.repository.InvoiceRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.atomic.AtomicReference;

import static lv.app.backend.util.Common.singleResult;

@Slf4j
@Component
@RequiredArgsConstructor
public class PDFInvoiceGenerator {

    private final UserService userService;
    private final ChildRepository childRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public ByteArrayInputStream generateInvoiceAdmin(Long invoiceId) {
        Invoice invoice = invoiceRepository.getReferenceById(invoiceId);
        return generateInvoice(invoice);
    }

    @Transactional
    public ByteArrayInputStream generateInvoiceUser(Long invoiceId) {
        Invoice invoice = userService.currentUser().getInvoices().stream()
                .filter(i -> i.getId().equals(invoiceId))
                .collect(singleResult());
        return generateInvoice(invoice);
    }

    private ByteArrayInputStream generateInvoice(Invoice invoice) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(out); PdfDocument pdfDoc = new PdfDocument(writer)) {
            Document document = new Document(pdfDoc);
            createDocument(document, invoice);
            document.close();
        } catch (Exception e) {
            log.error("Failed to generate invoice", e);
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private void createDocument(Document document, Invoice invoice) {
        Paragraph header = new Paragraph("Invoice")
                .setBold()
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(header);
        String companyInfo = """
                Your Company Name
                Your Company Address
                Phone: +123456789
                Email: info@company.com
                """;
        document.add(new Paragraph(companyInfo).setMarginBottom(10));
        User user = invoice.getUser();
        String customerDetails = """
                Bill To:
                %s
                Email: %s
                """.formatted(user.getFullName(), user.getUsername());
        document.add(new Paragraph(customerDetails).setMarginBottom(10));

        String invoiceInfo = """
                Invoice #: %d
                Invoice Date: %s
                Due Date: %s
                """.formatted(invoice.getId(), invoice.getDateIssued(), invoice.getDueDate());
        document.add(new Paragraph(invoiceInfo).setMarginBottom(10));

        float[] columnWidths = {2, 4, 2, 4, 2};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));


        table.addHeaderCell(new Cell().add(new Paragraph("Lesson No."))
                .setBackgroundColor(new DeviceRgb(211, 211, 211)));
        table.addHeaderCell(new Cell().add(new Paragraph("Topic"))
                .setBackgroundColor(new DeviceRgb(211, 211, 211)));
        table.addHeaderCell(new Cell().add(new Paragraph("Date"))
                .setBackgroundColor(new DeviceRgb(211, 211, 211)));
        table.addHeaderCell(new Cell().add(new Paragraph("Child"))
                .setBackgroundColor(new DeviceRgb(211, 211, 211)));
        table.addHeaderCell(new Cell().add(new Paragraph("Lesson Cost"))
                .setBackgroundColor(new DeviceRgb(211, 211, 211)));
        AtomicReference<Integer> i = new AtomicReference<>(0);
        invoice.getAttendances().forEach(a -> {
            Child child = childRepository.findEvenDeletedChild(a.getId());
            i.getAndSet(i.get() + 1);
            table.addCell(new Cell().add(new Paragraph(i.toString())));
            table.addCell(new Cell().add(new Paragraph(a.getLesson().getTopic())));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(a.getLesson().getDate()))));
            table.addCell(new Cell().add(new Paragraph(child.getFullName())));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(a.getCost()))));
        });
        document.add(table);

        String totals = """
                Subtotal: $%d
                Tax: $%d
                Total: $%d
                """.formatted(invoice.getAmount(), 100, invoice.getAmount() + 100);

        document.add(new Paragraph(totals)
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(10));

        Paragraph footer = new Paragraph("Payment due within 30 days. Thank you for your business.")
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20);
        document.add(footer);
    }

}
