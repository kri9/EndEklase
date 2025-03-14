package lv.app.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetToken(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Восстановление пароля");
        message.setText("Для восстановления пароля перейдите по ссылке:\n\n" +
                "http://localhost:8000/reset-password?token=" + token);

        mailSender.send(message);
    }
}

