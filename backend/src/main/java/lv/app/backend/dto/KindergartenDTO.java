package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class KindergartenDTO {
    private Long id;
    private String name;
    private String address;
    private String contactInfo;
    private List<GroupDTO> groups;

}

