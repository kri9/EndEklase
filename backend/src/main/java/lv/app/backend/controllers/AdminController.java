package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.dto.*;
import lv.app.backend.mappers.EntityMapper;
import lv.app.backend.model.Child;
import lv.app.backend.model.Invoice;
import lv.app.backend.service.ChildService;
import lv.app.backend.service.InvoiceCreationService;
import lv.app.backend.service.KindergartenService;
import lv.app.backend.service.LessonService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for admin exclusive endpoints
 */
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final EntityMapper entityMapper;
    private final ChildService childService;
    private final LessonService lessonService;
    private final KindergartenService kindergartenService;
    private final InvoiceCreationService invoiceCreationService;

    @GetMapping("/kindergartens")
    public ResponseEntity<List<KindergartenDTO>> getAllKindergartens() {
        List<KindergartenDTO> kindergartens = kindergartenService.getAllKindergartens();
        return ResponseEntity.ok(kindergartens);
    }

    @GetMapping("/kindergartens/{kindergartenId}/groups")
    public ResponseEntity<List<GroupDTO>> getGroupsByKindergarten(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long kindergartenId) {
        final String jwt = authHeader.substring(7);
        List<GroupDTO> groups = kindergartenService.getGroupsByKindergarten(kindergartenId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/groups/{groupId}/children")
    public ResponseEntity<List<ChildDTO>> getChildrenByGroup(@PathVariable Long groupId) {
        List<Child> children = childService.getChildrenByGroup(groupId);
        List<ChildDTO> childDTOs = children.stream()
                .map(entityMapper::childToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(childDTOs);
    }

    @GetMapping("/groups/{groupId}/lessons")
    public ResponseEntity<List<LessonDTO>> getLessonsByGroup(@PathVariable Long groupId) {
        List<LessonDTO> lessons = lessonService.getLessonsByGroup(groupId);
        return ResponseEntity.ok(lessons);
    }


    @PostMapping("/children")
    public ResponseEntity<Void> addChild(@RequestBody ChildDTO childDTO) {
        childService.saveChild(childDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/lessons")
    public ResponseEntity<Void> addLesson(@RequestBody LessonDTO lessonDTO) {
        lessonService.saveLesson(lessonDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/lessons")
    public ResponseEntity<List<LessonDTO>> getAllLessons() {
        List<LessonDTO> lessons = lessonService.getAllLessons();
        return ResponseEntity.ok(lessons);
    }

    @PostMapping("/invoice")
    public ResponseEntity<Void> createInvoice(@RequestBody InvoiceCreateDto dto) {
        invoiceCreationService.createInvoice(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/attendances")
    public ResponseEntity<Void> updateAttendance(@RequestBody AttendanceDTO attendanceDTO) {
        System.out.println("Received request to update attendance: " + attendanceDTO);
        lessonService.updateAttendanceStatus(attendanceDTO.getChildId(), attendanceDTO.getLessonId(), attendanceDTO.isAttended());
        System.out.println("Attendance updated successfully");
        return ResponseEntity.ok().build();
    }
    @GetMapping("/groups/{groupId}/attendances")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByGroup(@PathVariable Long groupId) {
        List<AttendanceDTO> attendances = lessonService.getAttendanceByGroup(groupId);
        return ResponseEntity.ok(attendances);
    }


}

