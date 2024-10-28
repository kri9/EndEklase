package lv.app.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.ChildDTO;
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

@Service
@RequiredArgsConstructor
public class ChildService {

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
}