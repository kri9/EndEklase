package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.InvoiceDTO;
import lv.app.backend.service.InvoiceService;
import lv.app.backend.service.LessonService;
import lv.app.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final LessonService lessonService;
    private final InvoiceService invoiceService;


    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByUser() {
        Long userId = userService.currentUser().getId();
        List<InvoiceDTO> invoices = invoiceService.getInvoicesByUser(userId);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/attendances")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByUser() {
        Long userId = userService.currentUser().getId();
        List<AttendanceDTO> attendances = lessonService.getAttendanceByUser(userId);
        return ResponseEntity.ok(attendances);
    }

}