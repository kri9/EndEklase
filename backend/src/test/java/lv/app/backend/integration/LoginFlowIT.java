package lv.app.backend.integration;

import lv.app.backend.dto.LoginResponse;
import lv.app.backend.dto.LoginUserDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

class LoginFlowIT extends AbstractIT {

    @Autowired
    private TestRestTemplate rest;

    @Test
    void login_and_checkAdminFlag() {
        // 1.  Login
        var loginBody = new LoginUserDTO("admini@test.com", "pass123");
        ResponseEntity<LoginResponse> login =
                rest.postForEntity("/login", loginBody, LoginResponse.class);

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = login.getBody().getToken();

        // 2.  Call a protected endpoint
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);

        ResponseEntity<Boolean> isAdmin =
                rest.exchange("/isadmin", HttpMethod.GET, new HttpEntity<>(h), Boolean.class);

        assertThat(isAdmin.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(isAdmin.getBody()).isTrue();
    }
}

