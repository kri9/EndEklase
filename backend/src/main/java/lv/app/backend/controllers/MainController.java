package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.LoginResponse;
import lv.app.backend.dto.LoginUserDTO;
import lv.app.backend.dto.Records;
import lv.app.backend.model.User;
import lv.app.backend.service.JwtService;
import lv.app.backend.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MainController {

    private final JwtService jwtService;
    private final UserService userService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("TEST STRING");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDTO loginUserDto) {
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

}
