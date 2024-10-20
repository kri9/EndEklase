package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.KindergartenDTO;
import lv.app.backend.dto.GroupDTO;
import lv.app.backend.model.Kindergarten;
import lv.app.backend.model.Group;
import lv.app.backend.model.repository.KindergartenRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KindergartenService {

    private final KindergartenRepository kindergartenRepository;

    public List<KindergartenDTO> getAllKindergartens() {
        return kindergartenRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private KindergartenDTO convertToDTO(Kindergarten kindergarten) {
        List<GroupDTO> groups = kindergarten.getGroups().stream()
                .map(group -> GroupDTO.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .build())
                .collect(Collectors.toList());

        return KindergartenDTO.builder()
                .id(kindergarten.getId())
                .name(kindergarten.getName())
                .address(kindergarten.getAddress())
                .contactInfo(kindergarten.getContactInfo())
                .groups(groups)
                .build();
    }

    public List<GroupDTO> getGroupsByKindergarten(Long kindergartenId) {
        Kindergarten kindergarten = kindergartenRepository.findById(kindergartenId)
                .orElseThrow(() -> new IllegalArgumentException("Kindergarten not found"));
        return kindergarten.getGroups().stream()
                .map(group -> GroupDTO.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .build())
                .collect(Collectors.toList());
    }

}
