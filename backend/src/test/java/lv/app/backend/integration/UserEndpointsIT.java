package lv.app.backend.integration;

import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.invoice.InvoiceDTO;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.UserRepository;
import lv.app.backend.service.JwtService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Simulates a “normal” parent account hitting /user APIs.
 */
class UserEndpointsIT extends AbstractIT {

    @Autowired
    TestRestTemplate rest;
    @Autowired
    JwtService jwtService;
    @Autowired
    UserRepository userRepository;

    private HttpHeaders userHeaders;

    @BeforeAll
    void loginAsFirstRegularUser() {
        // Pick the first non-admin user seeded by DataCreator
        User user = userRepository.findAll().stream()
                .filter(u -> u.getRole().equals(UserRole.USER))
                .findFirst()
                .orElseThrow();

        String jwt = jwtService.generateToken(user);
        userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(jwt);
    }

    @Test
    void userCanFetchOwnInvoices() {
        ResponseEntity<InvoiceDTO[]> resp = rest.exchange(
                "/user/invoices", HttpMethod.GET,
                new HttpEntity<>(userHeaders), InvoiceDTO[].class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();          // empty list is fine
    }

    @Test
    void userCanFetchOwnAttendances() {
        ResponseEntity<AttendanceDTO[]> resp = rest.exchange(
                "/user/attendances", HttpMethod.GET,
                new HttpEntity<>(userHeaders), AttendanceDTO[].class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
