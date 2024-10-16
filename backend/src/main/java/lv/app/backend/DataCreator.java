package lv.app.backend;

import lombok.RequiredArgsConstructor;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataCreator implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<User> all = userRepository.findAll();
        if (all.isEmpty()) {
            userRepository.save(User.builder()
                    .role(UserRole.ADMIN)
                    .password(passwordEncoder.encode("pass123"))
                    .username("admini")
                    .build());
        }
        else userRepository.save(User.builder()
                    .role(UserRole.USER)
                    .password(passwordEncoder.encode("pass12345"))
                    .username("Drewman")
                    .build());
    }
}
