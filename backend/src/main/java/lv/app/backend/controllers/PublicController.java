package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.GroupDTO;
import lv.app.backend.dto.KindergartenDTO;
import lv.app.backend.service.KindergartenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/public")
public class PublicController {

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
        List<GroupDTO> groups = kindergartenService.getGroupsByKindergarten(kindergartenId);
        return ResponseEntity.ok(groups);
    }

}
