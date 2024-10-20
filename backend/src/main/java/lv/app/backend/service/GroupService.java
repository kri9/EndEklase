package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.ChildDTO;
import lv.app.backend.model.Group;
import lv.app.backend.model.repository.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;

    public List<ChildDTO> getChildrenByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return group.getChildren().stream()
                .map(child -> ChildDTO.builder()
                        .id(child.getId())
                        .firstname(child.getFirstname())
                        .lastname(child.getLastname())
                        .build())
                .collect(Collectors.toList());
    }
}
