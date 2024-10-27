package lv.app.backend.dto;

public class Records {

    public record SignUp(String username, String password) {
    }

    public record UserInfo(Long id, String fullName) {
    }
}

