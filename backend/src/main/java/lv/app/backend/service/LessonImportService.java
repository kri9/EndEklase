package lv.app.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lv.app.backend.model.Group;
import lv.app.backend.model.Lesson;
import lv.app.backend.model.repository.GroupRepository;
import lv.app.backend.model.repository.KindergartenRepository;
import lv.app.backend.model.repository.LessonRepository;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class LessonImportService {

    private final LessonService lessonService;
    private final GroupRepository groupRepository;
    private final LessonRepository lessonRepository;
    private final KindergartenRepository kindergartenRepository;

    @SneakyThrows
    @Transactional
    public void importLesson(MultipartFile file) {
        XSSFWorkbook sheets = new XSSFWorkbook(file.getInputStream());
        XSSFSheet sheet = sheets.getSheetAt(0);
        DataFormatter dataFormatter = new DataFormatter();
        sheet.forEach(r -> {
            Lesson lesson = Lesson.builder()
                    .topic(r.getCell(0).getStringCellValue())
                    .notes(r.getCell(1).getStringCellValue())
                    .date(LocalDate.parse(dataFormatter.formatCellValue(r.getCell(2)), DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                    .group(resolveGroup(r))
                    .build();
            lessonRepository.save(lesson);
            lessonService.linkChildrenWithLesson(lesson);
            lessonRepository.saveAndFlush(lesson);
        });
    }

    private Group resolveGroup(Row row) {
        String kinderName = row.getCell(3).getStringCellValue();
        String groupName = row.getCell(4).getStringCellValue();
        var kindergarten = kindergartenRepository.findKindergartenByName(kinderName)
                .orElseThrow(() -> new IllegalArgumentException("Kindergarten not found: " + kinderName));
        return groupRepository.findGroupByKindergartenAndName(kindergarten, groupName)
                .orElseThrow(() -> new IllegalArgumentException(String.format("Group %s not found", groupName)));
    }
}
