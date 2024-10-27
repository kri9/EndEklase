package lv.app.backend.model.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum InvoiceStatus {
    NOT_PAID("NOT_ATTENDED"),
    PAID("ATTENDED"),
    EXPIRED("EXPIRED");

    private final String status;

}
