package lv.app.backend.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.function.Consumer;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Common {

    public static <T> T init(T t, Consumer<T> initializer) {
        initializer.accept(t);
        return t;
    }

    public static <T> List<T> intersection(List<T> a, List<T> b) {
        return a.stream().filter(b::contains).toList();
    }

}
