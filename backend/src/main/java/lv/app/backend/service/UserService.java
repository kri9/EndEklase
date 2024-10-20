package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.LoginUserDto;
import lv.app.backend.dto.Records;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public void saveUser(Records.SignUp signUp) {
        userRepository.save(User.builder()
                .username(signUp.username())
                .password(passwordEncoder.encode(signUp.password()))
                .build());
    }

    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()
                )
        );
        return userRepository.findByUsername(input.getUsername()).orElseThrow();
    }

    public boolean isAdmin(String username) {
        return userRepository.findByUsername(username)
                .map(u -> u.getRole().equals(UserRole.ADMIN))
                .orElse(false);
    }
}
