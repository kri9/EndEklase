package lv.app.backend.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.List;
import java.util.function.Consumer;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Common {

    public static <T> T init(T t, Consumer<T> initializer) {
        initializer.accept(t);
        return t;
    }

    public static <T> List<T> flatten(List<List<T>> list) {
        return list.stream().flatMap(Collection::stream).toList();
    }

}
