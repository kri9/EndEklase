package lv.app.backend.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lv.app.backend.common.IdSupplier;
import org.springframework.data.util.Pair;

import java.util.Collection;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Common {

    public static <T> T init(T t, Consumer<T> initializer) {
        initializer.accept(t);
        return t;
    }

    public static <T> List<T> flatten(List<List<T>> list) {
        return list.stream().flatMap(Collection::stream).toList();
    }

    public static <T> Collector<T, ?, T> singleResult() {
        return Collectors.collectingAndThen(
                Collectors.toSet(),
                set -> {
                    if (set.size() != 1) {
                        throw new IllegalStateException("Failed to resolve to single result");
                    }
                    return set.iterator().next();
                }
        );
    }

    public static <A1 extends IdSupplier, A2 extends IdSupplier>
    List<Pair<A1, A2>> matchIds(List<A1> o1, List<A2> o2) {
        BiFunction<List<A2>, Long, A2> idGetter =
                (l, i) -> l.stream().filter(o -> o.getId().equals(i)).collect(singleResult());
        return o1.stream()
                .map(p1 -> Pair.of(p1, idGetter.apply(o2, p1.getId())))
                .toList();
    }

}
