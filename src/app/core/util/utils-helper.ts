import moment from 'moment';

/**
 * Use this method to find a single data object from a data object array,
 * comparing each against a custom selection object, using properties.
 *
 * @param dataList  The list to find single data from. Constrained to Objects/Interfaces
 * @param dataProp - property of the the data object on which finding data is based.
 * @param selection - Custom selection of values - Must be Object , string or number.
 * @param selectionProp - property of the selection on which data property is compared against.
 * @param selectedPropChild - If variable 'selectionProp' is an object, this is the child property of
 *  'selectionProp' variable on which data property is compared against.
 */

export function findDataFromSelectionValues<T, P extends keyof T>(
  dataList: StrictObject<T>[],
  dataProp: P,
  selection: StringOrNumber
): T;

export function findDataFromSelectionValues<
  T,
  S,
  P extends keyof T,
  U extends keyof S,
  V extends keyof S[U]
>(
  dataList: StrictObject<T>[],
  dataProp: P,
  selection: StrictObject<S>,
  selectionProp?: U,
  selectedPropChild?: V
): T;

export function findDataFromSelectionValues<
  T,
  S,
  P extends keyof T,
  U extends keyof S,
  V extends keyof S[U]
>(
  dataList: StrictObject<T>[],
  dataProp: P,
  selection: StrictObject<S>,
  selectionProp?: U,
  selectedPropChild?: V
): T {
  const selectedValueToCompare = selectedPropChild
    ? selection[selectionProp][selectedPropChild]
    : selectionProp
      ? selection[selectionProp]
      : typeof selection === 'string' || typeof selection === 'number'
        ? selection
        : null;

  if (!selectedValueToCompare) {
    return null;
  }
  return dataList.find((data) => (data[dataProp] as any) === (selectedValueToCompare as any));
}

export function getMomentValue(value: unknown, format?: string) {
  const momentFormat = format || moment.ISO_8601;
  if (moment(value, momentFormat).isValid()) {
    if (!!format) {
      return moment(value, format);
    }
    return moment(value);
  }
  return null;
}

export type StrictObject<T> = Exclude<T, string | number | null>;
export type StringOrNumber = string | number;
