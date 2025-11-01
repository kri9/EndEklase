package lv.app.backend;

import lombok.RequiredArgsConstructor;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class AdminCreator implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin-password}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if(userRepository.findByUsername("admin").isPresent()) {
            return;
        }
        userRepository.save(User.builder()
                .role(UserRole.ADMIN)
                .password(passwordEncoder.encode(adminPassword))
                .username("admin")
                .firstName("The")
                .lastName("Administrator")
                .build());
    }

}
