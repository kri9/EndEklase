package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.*;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Child;
import lv.app.backend.model.User;
import lv.app.backend.service.ChildService;
import lv.app.backend.service.JwtService;
import lv.app.backend.service.KindergartenService;
import lv.app.backend.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final JwtService jwtService;
    private final UserService userService;
    private final EntityMapper entityMapper;
    private final ChildService childService;
    private final KindergartenService kindergartenService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("TEST STRING");
    }

    @PostMapping("/signup")
    private ResponseEntity<Void> signup(@RequestBody Records.SignUp signUp) {
        userService.saveUser(signUp);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = userService.authenticate(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = LoginResponse.builder()
                .token(jwtToken)
                .expiresIn(jwtService.getExpirationTime())
                .build();
        return ResponseEntity.ok(loginResponse);
    }

    @GetMapping("/isadmin")
    public ResponseEntity<Boolean> isAdmin(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        final String jwt = authHeader.substring(7);
        return ResponseEntity.ok(userService.isAdmin(jwtService.extractUsername(jwt)));
    }

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
        if (!userService.isAdmin(jwtService.extractUsername(jwt))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

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
