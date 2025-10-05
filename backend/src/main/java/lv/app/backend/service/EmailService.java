package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.model.User;
import lv.app.backend.model.repository.UserRepository;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${support-email}")
    private String supportEmailAddress;
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    public void sendResetToken(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Восстановление пароля");
        message.setText("Для восстановления пароля перейдите по ссылке:\n\n" +
                "http://localhost:8000/reset-password?token=" + token);

        mailSender.send(message);
    }

    public void sendErrorMessage(Exception e) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(supportEmailAddress);
        message.setSubject(e.getClass().getSimpleName() + ": " + e.getMessage());
        User user = currentPossibleUser().orElse(null);
        message.setText("User Info: %s\n%s".formatted(user, ExceptionUtils.getStackTrace(e)));
        mailSender.send(message);
    }

    private Optional<User> currentPossibleUser() {
        UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(principal.getUsername());
    }
}

