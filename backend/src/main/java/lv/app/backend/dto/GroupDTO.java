package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GroupDTO {
    private Long id;
    private String name;
}
