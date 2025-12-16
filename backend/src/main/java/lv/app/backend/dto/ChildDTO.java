package lv.app.backend.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import lv.app.backend.common.IdSupplier;

@Value
@Builder
@Jacksonized
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class ChildDTO implements IdSupplier {
    Long id;
    String firstname;
    String lastname;
    Long groupId;
    Long kindergartenId;
    Long userId;
}
