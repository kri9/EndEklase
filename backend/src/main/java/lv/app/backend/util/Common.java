package lv.app.backend.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.function.Consumer;
import java.util.function.Function;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Common {

    public static <T> T init(T t, Consumer<T> initializer) {
        initializer.accept(t);
        return t;
    }
}
