interface ObjectConstructor {
  /**
   * Groups members of an iterable according to the return value of the passed callback.
   * This definition should be removed once we upgrade angular , node and typescript as it is merged
   * into Typescript 5.4
   * @param items An iterable.
   * @param keySelector A callback which will be invoked for each item in items.
   */
  groupBy<K extends PropertyKey, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K
  ): Partial<Record<K, T[]>>;
}
