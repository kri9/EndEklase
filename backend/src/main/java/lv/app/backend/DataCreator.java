package lv.app.backend;

import lombok.RequiredArgsConstructor;
import lv.app.backend.model.*;
import lv.app.backend.model.enums.AttendanceStatus;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.List;

import static lv.app.backend.util.Common.init;

@Component
@RequiredArgsConstructor
public class DataCreator implements ApplicationRunner {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ChildRepository childRepository;
    private final PasswordEncoder passwordEncoder;
    private final LessonRepository lessonRepository;
    private final TransactionTemplate transactionTemplate;
    private final AttendanceRepository attendanceRepository;
    private final KindergartenRepository kindergartenRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<User> all = userRepository.findAll();
        if (all.isEmpty()) {
            transactionTemplate.execute(t -> {
                extracted();
                return t;
            });
        }
    }

    private void extracted() {
        Kindergarten kindergarten = init(new Kindergarten(), k -> {
            k.setName("Kindergarten 239");
            k.setAddress("123 Main St, Springfield");
            k.setContactInfo("+123456789");
            kindergartenRepository.saveAndFlush(k);
        });

        Group group = init(new Group(), g -> {
            g.setName("Group 5");
            g.setDescription("Group for 5-year-old kids");
            g.setKindergarten(kindergarten);
            groupRepository.saveAndFlush(g);
        });

        userRepository.save(User.builder()
                .role(UserRole.ADMIN)
                .password(passwordEncoder.encode("pass123"))
                .username("admini@test.com")
                .build());
        Child child = init(new Child(), c -> {
            c.setFirstname("George");
            c.setLastname("Bush");
            c.setGroup(group);
            childRepository.saveAndFlush(c);
            c.setGroup(init(new Group(), g -> {
                g.setName("US-Government");
                groupRepository.saveAndFlush(g);
            }));
            Lesson lesson = init(new Lesson(), l -> {
                l.setDate(LocalDate.of(2001, 9, 11));
                l.setTopic("Immigration");
                l.setNotes("Immigration bad");
                lessonRepository.saveAndFlush(l);
            });
            Lesson lesson2 = init(new Lesson(), l -> {
                l.setDate(LocalDate.of(2001, 10, 10));
                l.setTopic("Random");
                l.setNotes("Very random lesson");
                lessonRepository.saveAndFlush(l);
            });
            c.getAttendances().add(init(new Attendance(), a -> {
                a.setChild(c);
                a.setLesson(lesson);
                a.setStatus(AttendanceStatus.ATTENDED);
                attendanceRepository.saveAndFlush(a);
            }));
            c.getAttendances().add(init(new Attendance(), a -> {
                a.setChild(c);
                a.setLesson(lesson2);
                a.setStatus(AttendanceStatus.NOT_ATTENDED);
                attendanceRepository.saveAndFlush(a);
            }));
        });
        User normalUser = User.builder()
                .role(UserRole.USER)
                .password(passwordEncoder.encode("pass123"))
                .username("normie@normalson.com")
                .children(List.of(child))
                .build();
        userRepository.save(normalUser);
        child.setParent(normalUser);
    }
}
