package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.ChildDTO;
import lv.app.backend.model.Child;
import lv.app.backend.model.Group;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.ChildRepository;
import lv.app.backend.model.repository.GroupRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public void saveChild(ChildDTO childDTO) {
        Group group = groupRepository.findById(childDTO.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid group ID"));
        User parent = userRepository.findById(1L) // some get parent logic, ya vot hz, estj che pokuritj eshe
                .orElseThrow(() -> new IllegalArgumentException("Invalid parent ID"));

        Child child = Child.builder()
                .firstname(childDTO.getFirstname())
                .lastname(childDTO.getLastname())
                .group(group)
                .parent(parent)
                .build();

        childRepository.save(child);
    }

    public List<Child> getChildrenByGroup(Long groupId) {
        return childRepository.findByGroupId(groupId);
    }
}