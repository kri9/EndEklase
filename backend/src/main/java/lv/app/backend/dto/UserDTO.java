package lv.app.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    @JsonProperty("email")
    private String username;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String password;
    private boolean separateInvoices;
    private List<UserChildDTO> children = new ArrayList<>();
    private Integer discountRate;

    public record UserChildDTO(long id, String firstname, String lastname) {
    }
}


