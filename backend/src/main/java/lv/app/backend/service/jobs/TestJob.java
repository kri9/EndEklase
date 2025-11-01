package lv.app.backend.service.jobs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lv.app.backend.model.repository.UserRepository;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

@Slf4j
@RequiredArgsConstructor
public class TestJob implements Job {

    private final UserRepository userRepository;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        log.info("TESTING JOB");
        log.info("There are {} users", userRepository.count());
    }

}
