package lv.app.backend.service.ext;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.model.Invoice;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.User;
import lv.app.backend.model.klix.Client;
import lv.app.backend.model.klix.PaymentFormationRequest;
import lv.app.backend.model.klix.Product;
import lv.app.backend.model.klix.Purchase;
import lv.app.backend.model.repository.InvoiceRepository;
import lv.app.backend.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KlixPaymentFormationService {

    private final RestClient restClient;
    private final IPResolver ipResolver;
    private final UserService userService;
    private final InvoiceRepository invoiceRepository;

    @Value("${klix-brand-id}")
    private String brandId;
    @Value("${klix-secret-test-key}")
    private String secretKey;

    @Transactional
    public String getPaymentUrl(Long invoiceId) {
        Invoice invoice = invoiceRepository.getReferenceById(invoiceId);
        PaymentFormationRequest request = getRequest(invoice);
        log.info("Sending: " + request);
        Map response = restClient.post()
                .uri("https://portal.klix.app/api/v1/purchases/")
                .header("Authorization", "Bearer " + secretKey)
                .body(request)
                .retrieve()
                .body(Map.class);
        return (String) response.get("checkout_url");
    }

    private PaymentFormationRequest getRequest(Invoice invoice) {
        String publicIP = ipResolver.getPublicIP();
        User user = userService.currentUser();
        return PaymentFormationRequest.builder()
                .successCallback("http://" + publicIP + "/api/klix/success/" + invoice.getUuid())
                .successRedirect("http://" + publicIP)
                .cancelRedirect("http://" + publicIP)
                .failureRedirect("http://" + publicIP)
                .purchase(new Purchase("lv", getProducts(invoice)))
                .client(new Client(user.getUsername()))
                .brandId(brandId)
                .reference(invoice.getUuid().toString())
                .build();
    }

    private List<Product> getProducts(Invoice invoice) {
        return invoice.getAttendances().stream()
                .map(a -> {
                    Lesson l = a.getLesson();
                    return new Product(10L, "Lesson %s %s".formatted(l.getTopic(), l.getDate()));
                })
                .toList();
    }

}
