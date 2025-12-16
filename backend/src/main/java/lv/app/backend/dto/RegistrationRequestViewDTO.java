package lv.app.backend.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;

@Value
@Builder
@Jacksonized
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class RegistrationRequestViewDTO {
    Long id;
    String email;
    String firstName;
    String lastName;
    String phoneNumber;
    Long kindergartenId;
    String kindergartenName;
    Long groupId;
    String groupName;
    boolean emailConfirmed;
    String status;
    String childrenLine;
    LocalDateTime createdAt;
}
