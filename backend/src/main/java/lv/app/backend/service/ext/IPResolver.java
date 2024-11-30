package lv.app.backend.service.ext;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class IPResolver {

    @Value("${public-domain}")
    private String publicDomain;

    private final RestClient restClient;

    public String getPublicIP() {
        try {
            return publicDomain;
//            return fetchPublicIP();
        } catch (Exception e) {
            return publicDomain;
        }
    }

    private String fetchPublicIP() {
        String url = "https://api.ipify.org";
        return restClient.get().uri(url).retrieve().body(String.class);
    }

}
