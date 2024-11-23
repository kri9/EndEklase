package lv.app.backend.controllers;

import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.InvoiceDTO;
import lv.app.backend.service.InvoiceService;
import lv.app.backend.service.LessonService;
import lv.app.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private LessonService lessonService;

    @Autowired
    private UserService userService;


    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByUser(Principal principal) {
        String username = principal.getName();
        Long userId = userService.getUserIdByUsername(username);
        List<InvoiceDTO> invoices = invoiceService.getInvoicesByUser(userId);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/attendances")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByUser(Principal principal) {
        String username = principal.getName();
        Long userId = userService.getUserIdByUsername(username);
        List<AttendanceDTO> attendances = lessonService.getAttendanceByUser(userId);
        return ResponseEntity.ok(attendances);
    }

}