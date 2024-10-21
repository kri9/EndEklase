package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class KindergartenDTO {

    Long id;
    String name;
    String address;
    String contactInfo;
    List<GroupDTO> groups;
}

