package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;
import lv.app.backend.common.IdSupplier;

@Value
@Builder
public class ChildDTO implements IdSupplier {

    Long id;
    String firstname;
    String lastname;
    Long groupId;
    Long kindergartenId;
    Long userId;
}