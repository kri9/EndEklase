package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.ChildDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Attendance;
import lv.app.backend.model.Child;
import lv.app.backend.model.Group;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.AttendanceRepository;
import lv.app.backend.model.repository.ChildRepository;
import lv.app.backend.model.repository.GroupRepository;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import static lv.app.backend.util.Common.matchIds;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final EntityMapper entityMapper;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final GroupRepository groupRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public void saveChild(ChildDTO childDTO) {
        Group group = groupRepository.findById(childDTO.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid group ID"));
        User parent = userRepository.findById(childDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid parent ID"));

        Child child = Child.builder()
                .firstname(childDTO.getFirstname())
                .lastname(childDTO.getLastname())
                .group(group)
                .parent(parent)
                .build();
        childRepository.save(child);
        group.getLessons().stream()
                .map(l -> Attendance.builder().lesson(l).child(child).build())
                .forEach(attendanceRepository::saveAndFlush);
    }

    public List<Child> getChildrenByGroup(Long groupId) {
        return childRepository.findByGroupId(groupId);
    }

    public void updateChildren(List<ChildDTO> children) {
        List<Long> ids = children.stream().map(ChildDTO::getId).toList();
        List<Child> dbChildren = childRepository.findAllById(ids);
        matchIds(dbChildren, children).forEach(p -> {
            entityMapper.updateChild(p.getFirst(), p.getSecond());
            childRepository.save(p.getFirst());
        });
    }

    @Transactional
    public void deleteChild(Long childId) {
        childRepository.deleteById(childId);
    }
    @Transactional
    public void deleteChildren(List<Long> childIds) {
        childRepository.deleteAllByIdInBatch(childIds);
    }

}