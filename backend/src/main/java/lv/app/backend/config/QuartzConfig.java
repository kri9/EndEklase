package lv.app.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.quartz.QuartzProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

import java.util.Properties;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class QuartzConfig {

    private final QuartzProperties quartzProperties;

    @PostConstruct
    public void init() {
        log.debug("QuartzConfig initialized.");
    }

    @Bean
    public SchedulerFactoryBean quartzScheduler(
            ObjectProvider<Trigger> triggers,
            ObjectProvider<JobDetail> jobDetails,
            SpringBeanJobFactory springBeanJobFactory
    ) {
        SchedulerFactoryBean quartzScheduler = new SchedulerFactoryBean();
        quartzScheduler.setOverwriteExistingJobs(true);
        quartzScheduler.setSchedulerName("master-quartz-scheduler");

        Properties properties = new Properties();
        properties.putAll(quartzProperties.getProperties());
        quartzScheduler.setQuartzProperties(properties);
        quartzScheduler.setJobFactory(springBeanJobFactory);

        quartzScheduler.setTriggers(triggers.orderedStream().toArray(Trigger[]::new));
        quartzScheduler.setJobDetails(jobDetails.orderedStream().toArray(JobDetail[]::new));
        quartzScheduler.setWaitForJobsToCompleteOnShutdown(true);

        return quartzScheduler;
    }

    @Bean
    public SpringBeanJobFactory springBeanJobFactory(ApplicationContext applicationContext) {
        SpringBeanJobFactory springBeanJobFactory = new SpringBeanJobFactory();
        springBeanJobFactory.setApplicationContext(applicationContext);
        return springBeanJobFactory;
    }

}
