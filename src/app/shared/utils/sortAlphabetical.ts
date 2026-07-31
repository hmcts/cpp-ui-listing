import { SelectOption } from '@cpp/pdk';

export const sortAlphabetical = <T extends SelectOption<string>>(a: T, b: T): number => {
  const aText = a.label.toUpperCase();
  const bText = b.label.toUpperCase();

  return aText < bText ? -1 : aText > bText ? 1 : 0;
};
