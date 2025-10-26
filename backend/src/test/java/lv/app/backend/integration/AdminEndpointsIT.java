package lv.app.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lv.app.backend.dto.invoice.InvoiceDTO;
import lv.app.backend.dto.LoginResponse;
import lv.app.backend.dto.LoginUserDTO;
import lv.app.backend.dto.UserDTO;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end flow: login as admin → hit protected /admin endpoints.
 */
public class AdminEndpointsIT extends AbstractIT {

    @Autowired
    TestRestTemplate rest;
    @Autowired
    ObjectMapper mapper;

    private HttpHeaders adminHeaders;

    @BeforeAll
    void obtainAdminToken() {
        var loginBody = new LoginUserDTO("admini@test.com", "pass123");
        ResponseEntity<LoginResponse> login = rest.postForEntity(
                "/login", loginBody, LoginResponse.class);

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        String jwt = login.getBody().getToken();

        adminHeaders = new HttpHeaders();
        adminHeaders.setBearerAuth(jwt);
    }

    /* ------------------------------------------------------------
     * /admin/users
     * ---------------------------------------------------------- */
    @Test
    void listAllUsers_returnsPopulatedCollection() {
        ResponseEntity<UserDTO[]> resp = rest.exchange(
                "/admin/users", HttpMethod.GET,
                new HttpEntity<>(adminHeaders), UserDTO[].class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotEmpty();
    }

    /* ------------------------------------------------------------
     * /admin/invoices – create automatic invoices for a date range
     * ---------------------------------------------------------- */
    @Test
    void createInvoices_generatesAndPersistsInvoices() {
        Map<String, String> body = Map.of(
                "startDate", "2024-08-01",
                "endDate", "2025-06-30");

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, adminHeaders);

        ResponseEntity<InvoiceDTO[]> resp = rest.exchange(
                "/admin/invoices", HttpMethod.POST, entity, InvoiceDTO[].class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        InvoiceDTO[] created = resp.getBody();
        assertThat(created).isNotEmpty();                // at least one invoice

        // Simple invariant check – every DTO in the response has an ID & amount
        for (InvoiceDTO dto : created) {
            assertThat(dto.getId()).isPositive();
            assertThat(dto.getAmount()).isPositive();
        }
    }
}
