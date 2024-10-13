package lv.app.backend.dto;

import lombok.Value;

@Value
public class LoginUserDto {
    String username;
    String password;
}
