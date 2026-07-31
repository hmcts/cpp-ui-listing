import { FormControl, ValidatorFn } from '@angular/forms';

export function requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
  return function validate(control: FormControl) {
    if (Array.from(control.value || []).length < minRequired) {
      return {
        requireCheckboxesToBeChecked: true
      };
    }

    return null;
  };
}
