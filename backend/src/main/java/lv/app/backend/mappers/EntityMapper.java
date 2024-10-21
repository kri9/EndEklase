package lv.app.backend.mappers;

import lv.app.backend.dto.ChildDTO;
import lv.app.backend.model.Child;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = "spring")
public interface EntityMapper {

    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "kindergartenId", source = "group.kindergarten.id")
    ChildDTO childToDto(Child child);
}
