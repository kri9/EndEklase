package lv.app.backend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

class MainControllerIT extends AbstractIT {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testEndpoint_openToAll() throws Exception {
        assertThat(restTemplate.getForObject("/test", String.class))
                .isEqualTo("TEST STRING");
    }
}

