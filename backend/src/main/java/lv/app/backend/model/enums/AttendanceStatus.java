package lv.app.backend.model.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum AttendanceStatus {
    ATTENDED("ATTENDED"),
    NOT_ATTENDED("NOT_ATTENDED");

    private final String status;

}
