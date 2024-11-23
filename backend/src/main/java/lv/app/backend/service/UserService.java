package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.LoginUserDTO;
import lv.app.backend.dto.UserDTO;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.mappers.UserMapper;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public User createUser(UserDTO userDTO) {
        User user = userMapper.dtoToUser(userDTO);
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UserDTO userDTO) {
        User user = userRepository.getReferenceById(userDTO.getId());
        userMapper.updateUser(user, userDTO);
        return userRepository.save(user);
    }

    public User authenticate(LoginUserDTO input) {
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

    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

}
