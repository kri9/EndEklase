package lv.app.backend.service;

import io.jsonwebtoken.Jwts;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.RegistrationRequestDTO;
import lv.app.backend.model.*;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationRequestService {
    private final RegistrationRequestRepository requestRepo;
    private final RegistrationRequestChildRepository childRepo;
    private final RegistrationConfirmTokenRepository tokenRepo;

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createRequest(RegistrationRequestDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        if (requestRepo.existsByEmailIgnoreCase(email)) {
            // можно или запретить, или перезаписывать/обновлять заявку
            throw new IllegalArgumentException("Registration request already exists for this email");
        }

        RegistrationRequest req = RegistrationRequest.builder()
                .email(email)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .kindergartenId(dto.getKindergartenId())
                .groupId(dto.getGroupId())
                .status(RegistrationRequest.Status.EMAIL_PENDING)
                .emailConfirmed(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        req = requestRepo.save(req);

        if (dto.getChildren() != null) {
            for (var c : dto.getChildren()) {
                childRepo.save(RegistrationRequestChild.builder()
                        .request(req)
                        .firstname(c.getFirstname())
                        .lastname(c.getLastname())
                        .build());
            }
        }

        String token = java.util.UUID.randomUUID().toString();
        tokenRepo.save(RegistrationConfirmToken.builder()
                .token(token)
                .request(req)
                .expiryDate(java.time.LocalDateTime.now().plusHours(24))
                .build());

        emailService.sendRegistrationConfirm(email, token);
    }

    @Transactional
    public void confirmEmail(String token) {
        RegistrationConfirmToken t = tokenRepo.findById(Long.valueOf(token))
                .orElseThrow(() -> new IllegalArgumentException("Token not found"));

        if (t.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }

        RegistrationRequest req = ((RegistrationConfirmToken) t).getRequest();
        req.setEmailConfirmed(true);
        req.setStatus(RegistrationRequest.Status.APPROVAL_PENDING);
        requestRepo.save(req);
        tokenRepo.delete(t);
    }

    @Transactional
    public void approve(Long requestId) {
        RegistrationRequest req = requestRepo.findById(requestId).orElseThrow();
        if (!req.isEmailConfirmed()) {
            throw new IllegalStateException("Email not confirmed");
        }

        // создать User
        User user = User.builder()
                .username(req.getEmail())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phoneNumber(req.getPhoneNumber())
                .role(lv.app.backend.model.enums.UserRole.USER)
                // пароль можно временный (потом reset-password), или генерить и отправить
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString().substring(0, 10)))
                .discountRate(0.0)
                .build();
        user = userRepository.save(user);

        // создать детей в выбранную группу
        var group = groupRepository.findById(req.getGroupId()).orElseThrow();
        var kids = childRepo.findByRequestId(req.getId());
        for (var k : kids) {
            Child child = Child.builder()
                    .firstname(k.getFirstname())
                    .lastname(k.getLastname())
                    .parent(user)
                    .group(group)
                    .build();
            // важно: если у тебя при добавлении ребёнка создаются Attendance по урокам — используй твой ChildService.saveChild(),
            // либо вынеси в отдельный метод.
        }

        req.setStatus(RegistrationRequest.Status.APPROVED);
        requestRepo.save(req);
    }

    @Transactional
    public void reject(Long requestId) {
        RegistrationRequest req = requestRepo.findById(requestId).orElseThrow();
        req.setStatus(RegistrationRequest.Status.REJECTED);
        requestRepo.save(req);
    }

    public List<RegistrationRequest> pending() {
        return requestRepo.findByStatusOrderByCreatedAtDesc(RegistrationRequest.Status.APPROVAL_PENDING);
    }
}
