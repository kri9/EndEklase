package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.service.EmailService;
import lv.app.backend.service.ProfileChecker;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class ControllerExceptionHandler {

    private final ProfileChecker profileChecker;
    private final EmailService emailService;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        log.error("Got error: ", e);
        if (profileChecker.isProfileActive("prod")) {
            emailService.sendErrorMessage(e);
        }
        return ResponseEntity.internalServerError().body(e.getMessage());
    }
}
