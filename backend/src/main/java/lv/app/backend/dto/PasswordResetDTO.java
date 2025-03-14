package lv.app.backend.dto;

import lombok.Data;

@Data
public class PasswordResetDTO {
    private String token;
    private String newPassword;
}
