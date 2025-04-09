package lv.app.backend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.model.*;
import lv.app.backend.model.enums.AttendanceStatus;
import lv.app.backend.model.enums.UserRole;
import lv.app.backend.model.repository.*;
import net.datafaker.Faker;
import net.datafaker.providers.base.Address;
import net.datafaker.providers.base.Name;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static lv.app.backend.util.Common.init;

@Slf4j
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
    private final Random random = new Random(1970);
    private final Faker faker = new Faker(new Random(1970));
    private final Set<String> usedNames = new HashSet<>();

    private static final List<String> adjectives = Arrays.asList(
            "Sunny", "Little", "Happy", "Rainbow", "Bright", "Creative", "Growing", "Shining", "Playful", "Curious"
    );

    private static final List<String> themes = Arrays.asList(
            "Stars", "Butterflies", "Dreams", "Explorers", "Adventures", "Wonders", "Friends", "Meadows", "Gardens", "Joy"
    );

    private static final List<String> suffixes = Arrays.asList(
            "Kindergarten", "Preschool", "Academy", "Care Center", "Early Learning", "Playhouse", "Nursery"
    );

    private static final Map<String, List<String>> subjectsWithTopics = new HashMap<>();

    static {
        subjectsWithTopics.put("Mathematics", Arrays.asList("Algebra", "Geometry", "Calculus", "Statistics"));
        subjectsWithTopics.put("Science", Arrays.asList("Physics", "Chemistry", "Biology", "Earth Science"));
        subjectsWithTopics.put("History", Arrays.asList("World History", "American History", "Ancient Civilizations"));
        subjectsWithTopics.put("Geography", Arrays.asList("Physical Geography", "Human Geography", "Cartography"));
        subjectsWithTopics.put("Literature", Arrays.asList("Poetry", "Prose", "Drama", "Literary Criticism"));
        subjectsWithTopics.put("Biology", Arrays.asList("Genetics", "Ecology", "Microbiology", "Human Biology"));
        subjectsWithTopics.put("Chemistry", Arrays.asList("Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"));
        subjectsWithTopics.put("Physics", Arrays.asList("Mechanics", "Thermodynamics", "Quantum Physics"));
        subjectsWithTopics.put("Computer Science", Arrays.asList("Programming Fundamentals", "Algorithms", "Data Structures"));
        subjectsWithTopics.put("Art", Arrays.asList("Painting", "Sculpture", "Art History", "Photography"));
        subjectsWithTopics.put("Music", Arrays.asList("Music Theory", "Composition", "Instrumental Music", "Vocal Music"));
        subjectsWithTopics.put("Physical Education", Arrays.asList("Fitness Training", "Team Sports", "Individual Sports"));
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<User> all = userRepository.findAll();
        if (all.isEmpty()) {
            transactionTemplate.execute(t -> {
                extracted();
                return t;
            });
            log.info("All data created");
        }
    }

    private void extracted() {
        userRepository.save(User.builder()
                .role(UserRole.ADMIN)
                .password(passwordEncoder.encode("pass123"))
                .username("admini@test.com")
                .firstName("The")
                .lastName("Administrator")
                .build());
        List<Group> groups = Stream.of(
                        createKindergarten(),
                        createKindergarten(),
                        createKindergarten(),
                        createKindergarten(),
                        createKindergarten()
                )
                .flatMap(k -> k.getGroups().stream())
                .toList();
        log.info("Created Kindergartens");
        IntStream.range(0, 50).forEach(i -> {
            try100Times(() -> createUser(groups, random.nextInt(100) < 10, random.nextInt(100) < 20 ? 2 : 1));
        });
        log.info("Created Users");
        IntStream.range(0, 100).forEach(i -> {
            createLesson(groups);
        });
        log.info("Created Lessons");
    }

    private void try100Times(Runnable r) {
        for (int i = 0; i < 100; i++) {
            try {
                r.run();
                return;
            } catch (Exception e) {

            }
        }
    }

    private LocalDate generateRandomDate(LocalDate startDate, LocalDate endDate) {
        long startEpochDay = startDate.toEpochDay();
        long endEpochDay = endDate.toEpochDay();
        long randomEpochDay = startEpochDay + random.nextLong(endEpochDay - startEpochDay + 1);

        return LocalDate.ofEpochDay(randomEpochDay);
    }

    private LocalDate generate2024Date() {
        return generateRandomDate(LocalDate.of(2024, 8, 1), LocalDate.of(2025, 6, 20));
    }

    private Lesson createLesson(List<Group> groups) {
        Group group = groups.get(random.nextInt(groups.size()));
        String randomSubject = getRandomSubject();
        LocalDate lessonDate = generate2024Date();
        Lesson lesson = lessonRepository.save(Lesson.builder()
                .group(group)
                .topic(randomSubject)
                .notes(getRandomTopic(randomSubject))
                .date(lessonDate)
                .build());
        group.getLessons().add(lesson);
        group.getChildren().forEach(c -> {
            AttendanceStatus status = AttendanceStatus.NOT_ATTENDED;
            if (lessonDate.isBefore(LocalDate.now()) && random.nextInt(100) < 70) {
                status = AttendanceStatus.ATTENDED;
            }
            attendanceRepository.save(
                    Attendance.builder()
                            .lesson(lesson)
                            .child(c)
                            .status(status)
                            .build()
            );
        });
        return lesson;
    }


    private Kindergarten createKindergarten() {
        Address address = faker.address();
        Kindergarten kindergarten = init(new Kindergarten(), k -> {
            k.setName(generateRandomKindergartenName());
            k.setAddress(address.fullAddress());
            k.setContactInfo(faker.phoneNumber().phoneNumber());
        });
        kindergarten.getGroups().add(init(new Group(), g -> {
            String grpName = getGroupName();
            g.setName(grpName);
            g.setDescription(grpName + " of " + kindergarten.getName());
            g.setKindergarten(kindergarten);
            groupRepository.save(g);
        }));
        kindergarten.getGroups().add(init(new Group(), g -> {
            String grpName = getGroupName();
            g.setName(grpName);
            g.setDescription(grpName + " of " + kindergarten.getName());
            g.setKindergarten(kindergarten);
            groupRepository.save(g);
        }));
        return kindergartenRepository.save(kindergarten);
    }

    private String getGroupName() {
        String name = "Group " + random.nextInt(100);
        if (usedNames.contains(name)) {
            return getGroupName();
        }
        usedNames.add(name);
        return name;
    }

    record UserNameInfo(String firstName, String lastName, String email) {
    }

    private UserNameInfo fullName() {
        Name name = faker.name();
        String firstName = name.firstName();
        String lastName = name.lastName();
        String email = name.fullName().replaceAll("\\s+", "") + "@gmail.com";
        return new UserNameInfo(firstName, lastName, email);
    }

    private User createUser(List<Group> groups, boolean separateInvoices, int children) {
        UserNameInfo nameInfo = fullName();
        User user = userRepository.save(User.builder()
                .role(UserRole.USER)
                .password(passwordEncoder.encode("pass123"))
                .username(nameInfo.email)
                .firstName(nameInfo.firstName)
                .lastName(nameInfo.lastName)
                .separateInvoices(separateInvoices)
                .build());
        IntStream.range(0, children).forEach(i -> {
            Child child = init(new Child(), c -> {
                UserNameInfo childNameInfo = fullName();
                Group group = groups.get(random.nextInt(groups.size()));
                c.setFirstname(childNameInfo.firstName);
                c.setLastname(childNameInfo.lastName);
                c.setGroup(group);
                group.getChildren().add(c);
                c.setParent(user);
                childRepository.save(c);
            });
            user.getChildren().add(childRepository.save(child));
        });
        return user;
    }

    private String getRandomSubject() {
        List<String> keys = new ArrayList<>(subjectsWithTopics.keySet());
        return keys.get(random.nextInt(keys.size()));
    }

    private String getRandomTopic(String subject) {
        List<String> topics = subjectsWithTopics.get(subject);
        return topics.get(random.nextInt(topics.size()));
    }

    public String generateRandomKindergartenName() {
        String adjective = adjectives.get(random.nextInt(adjectives.size()));
        String theme = themes.get(random.nextInt(themes.size()));
        String suffix = suffixes.get(random.nextInt(suffixes.size()));
        String name = adjective + " " + theme + " " + suffix;
        if (usedNames.contains(name)) {
            return generateRandomKindergartenName();
        }
        usedNames.add(name);
        return name;
    }

}