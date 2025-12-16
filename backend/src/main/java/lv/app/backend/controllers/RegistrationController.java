package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.RegistrationRequestDTO;
import lv.app.backend.service.RegistrationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registration")
@RequiredArgsConstructor
public class RegistrationController {
    private final RegistrationRequestService service;

    @PostMapping("/request")
    public ResponseEntity<?> request(@RequestBody RegistrationRequestDTO dto) {
        service.createRequest(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam String token) {
        service.confirmEmail(token);
        return ResponseEntity.ok().build();
    }
}
