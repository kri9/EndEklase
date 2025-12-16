package lv.app.backend.dto;

import lombok.*;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Value
@Builder
@Jacksonized
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class RegistrationRequestDTO {
    Long kindergartenId;
    Long groupId;

    String email;
    String firstName;
    String lastName;
    String phoneNumber;

    List<ChildNameDTO> children;

    @Value
    @Builder
    @Jacksonized
    @AllArgsConstructor(access = AccessLevel.PUBLIC)
    public static class ChildNameDTO {
        String firstname;
        String lastname;
    }
}
