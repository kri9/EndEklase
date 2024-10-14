package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.LoginResponse;
import lv.app.backend.dto.LoginUserDto;
import lv.app.backend.dto.Records;
import lv.app.backend.model.User;
import lv.app.backend.service.JwtService;
import lv.app.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final JwtService jwtService;
    private final UserService userService;

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


}
