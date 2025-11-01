package lv.app.backend.config;

import lv.app.backend.service.jobs.DbBackupJob;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import static org.quartz.SimpleScheduleBuilder.simpleSchedule;

@Configuration
@Profile("prod")
public class JobConfig {

    @Bean
    public JobDetail dbBackupJob() {
        return JobBuilder.newJob(DbBackupJob.class)
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger trigger(@Qualifier("dbBackupJob") JobDetail jobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(jobDetail)
                .withSchedule(simpleSchedule().repeatForever().withIntervalInHours(24))
                .build();
    }
}
