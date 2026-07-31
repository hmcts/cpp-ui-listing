import { Directive, OnChanges, OnInit, SimpleChanges, input } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import { OrganisationUnit } from '@cpp/reference-data';
import { FilterOption } from '../core';

@Directive({
  selector: '[invalidEntry]',
  providers: [{ provide: NG_VALIDATORS, useExisting: InvalidEntryValidatorDirective, multi: true }]
})
export class InvalidEntryValidatorDirective implements OnInit, Validator, OnChanges {
  readonly labelCollection = input<string[]>(undefined, { alias: 'invalidEntry' });
  readonly inputValue = input<string>(null);

  defaultErrorMessage = { invalidEntry: 'Select Valid Entry' };
  constructor() {}

  ngOnInit() {
    const labelCollection = this.labelCollection();
    if (
      !labelCollection ||
      (labelCollection.length > 0 && typeof labelCollection[0] !== 'string')
    ) {
      throw new Error(
        'Can not use this invalidEntry rule without passing in a collection of strings to verify against.'
      );
    }
  }

  onChange: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputValue && this.onChange) {
      this.onChange();
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors {
    return this.labelCollection().length > 0 ? this.validateInvalidEntry()(control) : null;
  }

  validateInvalidEntry(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const requiredValue = this.inputValue() || control.value;
      if (!requiredValue) {
        return null;
      }
      if (this.isOrganistionUnit(requiredValue)) {
        return this.labelCollection().some((label) => label === requiredValue.oucodeL3Name)
          ? null
          : this.defaultErrorMessage;
      }

      if (this.isFilterOption(requiredValue)) {
        return this.labelCollection().some((label) => label === requiredValue.label)
          ? null
          : this.defaultErrorMessage;
      }

      if (typeof requiredValue === 'string') {
        return this.labelCollection().some((label) => label === requiredValue)
          ? null
          : this.defaultErrorMessage;
      }
    };
  }

  isOrganistionUnit(controlValue: OrganisationUnit): controlValue is OrganisationUnit {
    return controlValue.oucodeL3Name !== undefined;
  }

  isFilterOption(controlValue: FilterOption): controlValue is FilterOption {
    return controlValue.label !== undefined && controlValue.value !== undefined;
  }
}
