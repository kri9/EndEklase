package lv.app.backend.model.klix;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PaymentFormationRequest {
    private String successCallback;
    private String successRedirect;
    private String failureRedirect;
    private String cancelRedirect;
    private Purchase purchase;
    private Client client;
    private String brandId;
    private String reference;
}
