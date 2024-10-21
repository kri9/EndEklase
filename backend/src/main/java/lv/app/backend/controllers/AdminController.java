package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.ChildDTO;
import lv.app.backend.dto.GroupDTO;
import lv.app.backend.dto.KindergartenDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Child;
import lv.app.backend.service.ChildService;
import lv.app.backend.service.KindergartenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for admin exclusive endpoints
 */
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final EntityMapper entityMapper;
    private final ChildService childService;
    private final KindergartenService kindergartenService;

    @GetMapping("/kindergartens")
    public ResponseEntity<List<KindergartenDTO>> getAllKindergartens() {
        List<KindergartenDTO> kindergartens = kindergartenService.getAllKindergartens();
        return ResponseEntity.ok(kindergartens);
    }

    @GetMapping("/kindergartens/{kindergartenId}/groups")
    public ResponseEntity<List<GroupDTO>> getGroupsByKindergarten(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long kindergartenId) {
        final String jwt = authHeader.substring(7);
        List<GroupDTO> groups = kindergartenService.getGroupsByKindergarten(kindergartenId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/groups/{groupId}/children")
    public ResponseEntity<List<ChildDTO>> getChildrenByGroup(@PathVariable Long groupId) {
        List<Child> children = childService.getChildrenByGroup(groupId);
        List<ChildDTO> childDTOs = children.stream()
                .map(entityMapper::childToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(childDTOs);
    }

    @PostMapping("/children")
    public ResponseEntity<Void> addChild(@RequestBody ChildDTO childDTO) {
        childService.saveChild(childDTO);
        return ResponseEntity.ok().build();
    }
}
