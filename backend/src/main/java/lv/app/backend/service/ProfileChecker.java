package lv.app.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProfileChecker {

    @Autowired
    private Environment env;

    public boolean isProfileActive(String profile) {
        for (String activeProfile : env.getActiveProfiles()) {
            if (activeProfile.equals(profile)) {
                return true;
            }
        }
        return false;
    }
}
