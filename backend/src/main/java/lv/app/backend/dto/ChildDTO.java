package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ChildDTO {

    Long id;
    String firstname;
    String lastname;
    Long groupId;
    Long kindergartenId;
    Long userId;
}