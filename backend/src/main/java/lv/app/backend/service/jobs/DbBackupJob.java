package lv.app.backend.service.jobs;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.service.EmailService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@RequiredArgsConstructor
public class DbBackupJob implements Job {

    private final S3Client s3Client;
    private final EmailService emailService;

    @Override
    @SneakyThrows
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            backupJob();
        } catch (Exception e) {
            log.error("Error doing DB backup", e);
            emailService.sendErrorMessage(e);
        }
    }

    private void backupJob() throws IOException {
        log.info("Executing DB backup job");
        Path dbdata = new File("dbdata").toPath();
        Path tempZip = Files.createTempFile("zip-upload", ".zip");
        zipDirectory(dbdata, tempZip);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        String key = "db-backup-" + LocalDateTime.now().format(formatter) + ".zip";
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket("funnyenglish-db-backups")
                .key(key)
                .contentType("application/zip")
                .build();

        s3Client.putObject(put, RequestBody.fromFile(tempZip));
        Files.deleteIfExists(tempZip);
        log.info("Finished DB backup job: " + key);
    }

    private static void zipDirectory(Path sourceDir, Path targetZip) throws IOException {
        Files.createDirectories(targetZip.getParent());

        try (OutputStream fos = Files.newOutputStream(targetZip, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
             ZipOutputStream zos = new ZipOutputStream(fos)) {

            Path root = sourceDir.toRealPath();

            Files.walkFileTree(root, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                    // Add a directory entry (optional but nice for empty dirs)
                    Path rel = root.relativize(dir);
                    if (!rel.toString().isEmpty()) {
                        String entryName = rel.toString().replace('\\', '/') + "/";
                        zos.putNextEntry(new ZipEntry(entryName));
                        zos.closeEntry();
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Path rel = root.relativize(file);
                    String entryName = rel.toString().replace('\\', '/');
                    ZipEntry entry = new ZipEntry(entryName);
                    entry.setTime(Files.getLastModifiedTime(file).toMillis());
                    zos.putNextEntry(entry);
                    Files.copy(file, zos);
                    zos.closeEntry();
                    return FileVisitResult.CONTINUE;
                }
            });
        }
    }

}
