package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.LoginResponse;
import lv.app.backend.dto.LoginUserDto;
import lv.app.backend.model.User;
import lv.app.backend.service.AuthenticationService;
import lv.app.backend.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final JwtService jwtService;
    private final JdbcTemplate jdbcTemplate;
    private final AuthenticationService authenticationService;

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "Some test";
    }

    @GetMapping("/test2")
    @ResponseBody
    public List<Map<String, Object>> test2() {
        return jdbcTemplate.queryForList("select * from test_table");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = LoginResponse.builder()
                .token(jwtToken)
                .expiresIn(jwtService.getExpirationTime())
                .build();

        return ResponseEntity.ok(loginResponse);
    }


}
