package lv.app.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "Some test";
    }

    @GetMapping("/test2")
    @ResponseBody
    public List<Map<String, Object>> test2() {
        return jdbcTemplate.queryForList("select * from test_table");
    }

}
