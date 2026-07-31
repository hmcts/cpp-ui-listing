export const filterFormValues = <T>(values: T): T => {
  return Object.keys(values).reduce(
    (valueMap, key) => {
      if (values[key as keyof T]) {
        return { ...valueMap, [key]: values[key as keyof T] };
      }
      return valueMap;
    },
    {} as T
  );
};
