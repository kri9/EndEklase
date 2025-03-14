package lv.app.backend.controllers;

import lv.app.backend.model.PasswordResetToken;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.PasswordResetTokenRepository;
import lv.app.backend.service.EmailService;
import lv.app.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final UserService userService;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@RequestParam String email) {
        Optional<User> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.ok().build();
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(resetToken);
        emailService.sendResetToken(email, token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String password) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Токен истёк или не найден.");
        }

        User user = tokenOpt.get().getUser();
        userService.updatePassword(user, password);
        tokenRepository.delete(tokenOpt.get());

        return ResponseEntity.ok().build();
    }
}
