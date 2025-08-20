package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.LoginUserDTO;
import lv.app.backend.dto.UserDTO;
import lv.app.backend.mappers.UserMapper;
import lv.app.backend.model.User;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(UserDTO userDTO) {
        User user = userMapper.dtoToUser(userDTO);
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    public User currentUser() {
        UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(principal.getUsername()));
    }

    @Transactional
    public User updateUser(UserDTO userDTO) {
        User user = userRepository.getReferenceById(userDTO.getId());
        userMapper.updateUser(user, userDTO);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
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

    public Optional<User> findByEmail(String email) {
        return userRepository.findByUsername(email);
    }

    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}
