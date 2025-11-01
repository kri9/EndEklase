package lv.app.backend.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class JobConfig {

//    @Bean("testJob")
//    public JobDetail jobDetail() {
//        return JobBuilder.newJob(TestJob.class)
//                .storeDurably()
//                .build();
//    }
//
//    @Bean
//    public Trigger trigger(@Qualifier("testJob") JobDetail jobDetail) {
//        return TriggerBuilder.newTrigger()
//                .forJob(jobDetail)
//                .withSchedule(simpleSchedule().repeatForever().withIntervalInSeconds(5))
//                .build();
//    }
}
