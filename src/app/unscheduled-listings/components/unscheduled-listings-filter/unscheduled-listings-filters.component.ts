import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  input,
  output
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {
  ValidationError,
  PdkFillColorDirective,
  PdkPaddingDirective,
  PdkMarginDirective,
  PdkFormComponent,
  PdkTypographyDirective,
  PdkGridComponent,
  PdkGridDirective,
  PdkFormFieldComponent,
  PdkSelectComponent,
  PdkAutosuggestLiteComponent,
  PdkInputComponent,
  PdkInputDirective,
  PdkTextInputDirective,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkLinkDirective
} from '@cpp/pdk';
import { FilterOption, SelectedFilterOptions } from '../../../core/model';
import * as _ from 'lodash-es';
import { findDataFromSelectionValues } from '../../../core/util';
import { OrganisationUnit } from '@cpp/reference-data';

import { InvalidEntryValidatorDirective } from '../../../shared/invalid-entry.validator.directive';

@Component({
  selector: 'unscheduled-listings-filters',
  templateUrl: './unscheduled-listings-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkFillColorDirective,
    PdkPaddingDirective,
    PdkMarginDirective,
    FormsModule,
    PdkFormComponent,
    PdkTypographyDirective,
    PdkGridComponent,
    PdkGridDirective,
    PdkFormFieldComponent,
    PdkSelectComponent,
    PdkAutosuggestLiteComponent,
    InvalidEntryValidatorDirective,
    PdkInputComponent,
    PdkInputDirective,
    PdkTextInputDirective,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkLinkDirective
  ]
})
export class UnscheduledListingsFiltersComponent implements OnChanges, OnInit {
  get currentCourtCentreOption(): FilterOption {
    if (this.localSelectedOptions && this.localSelectedOptions.courtCentreId) {
      return findDataFromSelectionValues(
        this.courtOptions,
        'value',
        this.localSelectedOptions,
        'courtCentreId'
      );
    }
    return null;
  }

  readonly ALL_COURTS: FilterOption = { value: 'ALL', label: 'All courts' };
  readonly ALL_ORGANISATION_UNITS: FilterOption = {
    value: 'ALL',
    label: 'Choose organisation unit'
  };
  readonly ALL_TYPES_OF_LISTS: FilterOption = { value: 'ALL', label: 'Choose type' };

  @ViewChild('form') form: NgForm;
  readonly selectedOptions = input<SelectedFilterOptions>(undefined);
  readonly organisationUnits = input<OrganisationUnit[]>(undefined);
  readonly typeOfListCodeOptions = input<FilterOption[]>(undefined);

  readonly onApplyFilters = output<SelectedFilterOptions>();
  readonly onClearFilters = output<void>();
  readonly onValidationError = output<ValidationError[]>();

  orgUnitOptions: FilterOption[];
  courtOptions: FilterOption[];
  typeOfListOptions: FilterOption[];
  localSelectedOptions: SelectedFilterOptions;
  orgUnitMap = new Map<string, OrganisationUnit[]>();

  resetForm: boolean;
  courtInputValue: string;

  constructor(private cd: ChangeDetectorRef) {
    this.resetForm = false;
  }

  ngOnInit() {
    this.initializeOrgUnitOptions();
    this.initializeCourtOptions();
  }

  private initializeOrgUnitOptions(): void {
    const orgUnitOptions: FilterOption[] = [];
    this.organisationUnits().forEach((orgUnit) => {
      const oucodeL2CodeKey = orgUnit.oucodeL2Code;
      if (this.orgUnitMap.has(oucodeL2CodeKey)) {
        this.orgUnitMap.get(oucodeL2CodeKey).push(orgUnit);
      } else {
        this.orgUnitMap.set(oucodeL2CodeKey, [orgUnit]);
        orgUnitOptions.push({ label: orgUnit.oucodeL2Name, value: orgUnit.oucodeL2Code });
      }
    });
    this.orgUnitOptions = [this.ALL_ORGANISATION_UNITS, ...orgUnitOptions];
  }

  private initializeCourtOptions(): void {
    this.courtOptions = this.organisationUnits().map((orgUnit) => {
      return {
        label: orgUnit.oucodeL3Name,
        value: orgUnit.id
      } as FilterOption;
    });

    this.courtOptions = [this.ALL_COURTS, ...this.courtOptions];
  }

  handleCourtOptionChange(option: FilterOption): void {
    this.localSelectedOptions.courtCentreId = option && option.value;
  }

  handleOrgUnitOptionChange(value: string): void {
    if (value === 'ALL') {
      this.initializeCourtOptions();
    } else {
      this.localSelectedOptions.oucodeL2Code = value;
      const filteredCourtOptions = this.orgUnitMap
        .get(this.localSelectedOptions.oucodeL2Code)
        .map((orgUnit) => {
          return { label: orgUnit.oucodeL3Name, value: orgUnit.id };
        });

      this.courtOptions = [this.ALL_COURTS, ...filteredCourtOptions];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedOptions) {
      this.localSelectedOptions = { ...this.selectedOptions() };
    }

    if (changes.typeOfListCodeOptions) {
      this.typeOfListOptions = [this.ALL_TYPES_OF_LISTS, ...this.typeOfListCodeOptions()];
    }
  }

  getSuggestions(value: string): FilterOption[] {
    this.handleOrgUnitOptionChange(this.localSelectedOptions.oucodeL2Code);
    if (value) {
      return this.courtOptions.filter(
        (option) => option.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    }
    return [];
  }

  getOptionLabels(options: FilterOption[]): string[] {
    return options.map((option) => option.label);
  }

  applyFilters({ value }): void {
    const formValues = _.mapValues(value, (option) =>
      this.isFilterOption(option) ? option.value : option
    );
    this.onApplyFilters.emit(formValues);
  }

  clearFilters(): void {
    this.resetForm = true;
    this.cd.detectChanges();
    this.resetForm = false;

    this.onValidationError.emit(null);
    this.onClearFilters.emit();
    this.initializeCourtOptions();
  }

  validationErrors(errors: ValidationError[]): void {
    this.onValidationError.emit(errors);
  }

  isFilterOption(option: FilterOption): boolean {
    return option.label !== undefined && option.value !== undefined;
  }
}
