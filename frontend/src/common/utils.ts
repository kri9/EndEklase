
export function compareTo(x: any, y: any) {
  return (x < y) ? -1 : ((x == y) ? 0 : 1);
}

export function sortBy<T>(...getters: Array<(a: T) => any>) {
  getters = getters.reverse();
  const getter = getters.pop()!;
  function sortCmp(getter: (a: T) => any) {
    return (a: any, b: any): 1 | -1 | 0 => {
      const r = compareTo(getter(b), getter(a));
      if (r == 0 && getters.length != 0) {
        return sortCmp(getters.pop()!)(a, b);
      }
      return r;
    };
  }
  return sortCmp(getter);
}

