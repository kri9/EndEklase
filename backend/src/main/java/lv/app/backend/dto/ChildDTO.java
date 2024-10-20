package lv.app.backend.dto;

import lombok.Builder;
import lombok.Value;
import lv.app.backend.model.Child;

@Value
@Builder
public class ChildDTO {
    Long id;
    String firstname;
    String lastname;
    Long groupId;
    Long kindergartenId;

    public static ChildDTO fromEntity(Child child) {
        return ChildDTO.builder()
                .id(child.getId())
                .firstname(child.getFirstname())
                .lastname(child.getLastname())
                .groupId(child.getGroup() != null ? child.getGroup().getId() : null)
                .kindergartenId(child.getGroup() != null && child.getGroup().getKindergarten() != null ? child.getGroup().getKindergarten().getId() : null)
                .build();
    }
}