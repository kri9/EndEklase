package lv.app.backend.controllers;

import lv.app.backend.dto.AttendanceDTO;
import lv.app.backend.dto.InvoiceDTO;
import lv.app.backend.service.InvoiceService;
import lv.app.backend.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private LessonService lessonService;

    @GetMapping("/{userId}/invoices")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByUser(@PathVariable Long userId) {
        List<InvoiceDTO> invoices = invoiceService.getInvoicesByUser(userId);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{userId}/attendances")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByUser(@PathVariable Long userId) {
        List<AttendanceDTO> attendances = lessonService.getAttendanceByUser(userId);
        return ResponseEntity.ok(attendances);
    }
}