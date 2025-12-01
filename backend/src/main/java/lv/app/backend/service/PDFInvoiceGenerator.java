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
import lv.app.backend.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import lv.app.backend.model.Attendance;

import static lv.app.backend.util.Common.singleResult;

@Slf4j
@Component
@RequiredArgsConstructor
public class PDFInvoiceGenerator {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${lesson-attendance-cost:300}")
    private Long lessonCost;

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
        try (PdfWriter writer = new PdfWriter(out);
             PdfDocument pdfDoc = new PdfDocument(writer)) {
            Document document = new Document(pdfDoc);
            createDocument(document, invoice);
            document.close();
        } catch (Exception e) {
            log.error("Failed to generate invoice", e);
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private static String eur(long cents) {
        return String.format(Locale.US, "%.2f €", cents / 100.0);
    }

    private static String nz(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    private String resolveKindergartenName(Invoice invoice) {
        return invoice.getAttendances().stream()
                .map(Attendance::getChild)
                .filter(Objects::nonNull)
                .map(c -> c.getGroup())
                .filter(Objects::nonNull)
                .map(g -> g.getKindergarten())
                .filter(Objects::nonNull)
                .map(k -> k.getName())
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private String buildBankBlock(Invoice invoice) {
        String kgName = resolveKindergartenName(invoice);

        log.debug("Resolved kindergarten for invoice {}: {}", invoice.getId(), kgName);

        if ("Domino".equalsIgnoreCase(kgName)) {
            return """
                    Citadele Bank
                    Kods: PARXLV22
                    Konts: LV36PARX0009486840002

                    Maksājumā mērķī lūdzu norādīt:
                    P.I.I. numuru, bērna vārdu uzvārdu un grupas numuru.
                    """;
        } else if ("PII 193".equalsIgnoreCase(kgName)) {
            return """
                    Citadele Bank
                    Kods: PARXLV22
                    Konts: LV36PARX0009486840002

                    Maksājumā mērķī lūdzu norādīt:
                    P.I.I. numuru, bērna vārdu uzvārdu un grupas numuru.
                    """;
        } else if ("PII 216".equalsIgnoreCase(kgName)) {
            return """
                    Irina Kicenko p/k 061073–10808
                    Swedbank Bank
                    Kods: HABALV22
                    Konts: LV73HABA0551059075292

                    Maksājumā mērķī lūdzu norādīt:
                    P.I.I. numuru, bērna vārdu uzvārdu un grupas numuru.
                    """;
        } else {
            // дефолт: PII 239 Luminor (как было)
            return """
                    Luminor Bank
                    Kods: RIKOLV2X
                    Konts: LV39RIKO0002221262931

                    Maksājumā mērķī lūdzu norādīt:
                    P.I.I. numuru, bērna vārdu uzvārdu un grupas numuru.
                    """;
        }
    }

    private void createDocument(Document document, Invoice invoice) throws IOException {
        PdfFont font;
        try (InputStream is = new ClassPathResource("fonts/DejaVuSans.ttf").getInputStream()) {
            byte[] fontBytes = is.readAllBytes();
            font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
        }
        document.setFont(font);
        document.add(new Paragraph("Rēķins")
                .setBold()
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER));

        String companyInfo = """
                Funny English
                Telefons: +37129729107
                Email: irina.kicenko@gmail.com
                """;
        document.add(new Paragraph(companyInfo).setMarginBottom(10));
        User user = userRepository.findDeletedByInvoice(invoice.getId());
        String customerDetails = """
                Rēķins (kam):
                %s
                Email: %s
                """.formatted(user.getFullName(), user.getUsername());
        document.add(new Paragraph(customerDetails).setMarginBottom(10));

        String invoiceInfo = """
                Rēķins #: %d
                Maksājuma datums: %s
                Maksājuma termiņš: %s
                """.formatted(invoice.getId(), invoice.getDateIssued(), invoice.getDueDate());
        document.add(new Paragraph(invoiceInfo).setMarginBottom(10));

        float[] columnWidths = {1.2f, 3.5f, 2.2f, 3.2f, 1.9f};
        Table table = new Table(UnitValue.createPercentArray(columnWidths)).setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Stunda Nr.", "Temats", "Datums", "Bērns", "Stundas cena"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(h))
                    .setBackgroundColor(new DeviceRgb(211, 211, 211))
                    .setBold());
        }
        AtomicReference<Integer> row = new AtomicReference<>(0);
        invoice.getAttendances().forEach(a -> {
            Child child = a.getChild();
            long costCents = (a.getCost() != null && a.getCost() > 0) ? a.getCost() : lessonCost;
            table.addCell(new Cell().add(new Paragraph(String.valueOf(row.updateAndGet(v -> v + 1)))));
            table.addCell(new Cell().add(new Paragraph(nz(a.getLesson().getTopic()))));
            table.addCell(new Cell().add(new Paragraph(nz(a.getLesson().getDate()))));
            table.addCell(new Cell().add(new Paragraph(child != null ? nz(child.getFullName()) : "")));
            table.addCell(new Cell().add(new Paragraph(eur(costCents))).setTextAlignment(TextAlignment.RIGHT));
        });
        document.add(table);
        long totalCents = invoice.getAmount() != null ? invoice.getAmount() : 0L;
        document.add(new Paragraph("Kopējā summa: " + eur(totalCents))
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(10));

        String bankBlock = buildBankBlock(invoice);
        document.add(new Paragraph(bankBlock)
                .setTextAlignment(TextAlignment.LEFT)
                .setMarginTop(15)
                .setFontSize(11));

        Paragraph footer = new Paragraph("Apmāksu veiciet 10 dienu laikā. Paldies!")
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20);
        document.add(footer);
    }
}