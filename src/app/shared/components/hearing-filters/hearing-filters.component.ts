import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {
  ValidationError,
  PdkFillColorDirective,
  PdkFormComponent,
  PdkFieldsetComponent,
  PdkPaddingDirective,
  PdkMarginDirective,
  PdkFieldsetLegendDirective,
  PdkFormFieldComponent,
  PdkAutosuggestLiteComponent,
  PdkSelectComponent,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkLinkDirective
} from '@cpp/pdk';
import * as _ from 'lodash-es';
import { CourtSummary, FilterOption, HearingType, Jurisdiction, Prosecutor } from '../../../core';
import { SelectedFilterOptions } from '../../../core/model/';
import { findDataFromSelectionValues } from '../../../core/util';
import { buildOption } from '../../../../util';

import { InvalidEntryValidatorDirective } from '../../invalid-entry.validator.directive';

@Component({
  selector: 'hearing-filters',
  templateUrl: './hearing-filters.component.html',
  styleUrls: ['./hearing-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkFillColorDirective,
    FormsModule,
    PdkFormComponent,
    PdkFieldsetComponent,
    PdkPaddingDirective,
    PdkMarginDirective,
    PdkFieldsetLegendDirective,
    PdkFormFieldComponent,
    PdkAutosuggestLiteComponent,
    InvalidEntryValidatorDirective,
    PdkSelectComponent,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkLinkDirective
  ]
})
export class HearingFiltersComponent implements OnInit, OnChanges {
  get currentCourtCentreOption() {
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

  get currentProsecutorOption() {
    if (this.localSelectedOptions && this.localSelectedOptions.authorityId) {
      return findDataFromSelectionValues(
        this.prosecutorOptions,
        'value',
        this.localSelectedOptions,
        'authorityId'
      );
    }
    return null;
  }

  get currentHearingTypeOption() {
    if (this.localSelectedOptions && this.localSelectedOptions.hearingTypeId) {
      return findDataFromSelectionValues(
        this.hearingTypeOptions,
        'value',
        this.localSelectedOptions,
        'hearingTypeId'
      );
    }
    return null;
  }

  readonly ALL_COURTS: CourtSummary = { id: 'ALL', name: 'All courts' };
  readonly ALL_PROSECUTORS: Prosecutor = { id: 'ALL', name: 'All prosecutors' };
  readonly ALL_HEARING_TYPES: HearingType = { id: 'ALL', name: 'All hearing types' };
  readonly ALL_JURISDICTIONS: Jurisdiction = { id: 'ALL', name: 'All jurisdictions' };
  readonly ALL_POSSIBLE_DISQULAIFICATION: Jurisdiction = { id: 'ALL', name: 'All' };

  @ViewChild('form') form: NgForm;
  readonly selectedOptions = input<SelectedFilterOptions>(undefined);
  readonly courts = input<CourtSummary[]>(undefined);
  readonly prosecutors = input<Prosecutor[]>(undefined);
  readonly hearingTypes = input<HearingType[]>(undefined);
  readonly jurisdictions = input<Jurisdiction[]>(undefined);

  readonly onApplyFilters = output<SelectedFilterOptions>();
  readonly onClearFilters = output<void>();
  readonly onValidationError = output<ValidationError[]>();

  courtInputValue: string;
  hearingTypeInputValue: string;
  prosecutorInputValue: string;
  courtOptions: FilterOption[];
  prosecutorOptions: FilterOption[];
  hearingTypeOptions: FilterOption[];
  jurisdictionOptions: FilterOption[];
  courtSuggestions: FilterOption[] = [];
  prosecutorSuggestions: FilterOption[] = [];
  hearingTypesSuggestions: FilterOption[] = [];
  possibleDisqualificationOptions: FilterOption[] = [];
  localSelectedOptions: SelectedFilterOptions;

  resetForm: boolean;

  constructor(private cd: ChangeDetectorRef) {
    this.resetForm = false;
  }

  ngOnInit() {
    this.possibleDisqualificationOptions = this.buildOptionsForInput([
      this.ALL_POSSIBLE_DISQULAIFICATION,
      { id: 'true', name: 'Yes', value: 'true' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.courts) {
      this.courtOptions = this.buildOptionsForInput([this.ALL_COURTS, ...this.courts()]);
    }
    if (changes.prosecutors) {
      this.prosecutorOptions = this.buildOptionsForInput([
        this.ALL_PROSECUTORS,
        ...this.prosecutors()
      ]);
    }
    if (changes.hearingTypes) {
      this.hearingTypeOptions = this.buildOptionsForInput([
        this.ALL_HEARING_TYPES,
        ...this.hearingTypes()
      ]);
    }
    if (changes.jurisdictions) {
      this.jurisdictionOptions = this.buildOptionsForInput([
        this.ALL_JURISDICTIONS,
        ...this.jurisdictions()
      ]);
    }
    if (changes.selectedOptions) {
      this.localSelectedOptions = { ...this.selectedOptions() };
    }
  }

  getSuggestions(value: string, options: FilterOption[]) {
    if (value) {
      return options.filter(
        (option) => option.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    }
    return [];
  }

  getOptionLabels(options: FilterOption[]) {
    return options.map((option) => option.label);
  }

  buildOptionsForInput(modelList: any[]): FilterOption[] {
    const filteredList = modelList.filter((model) => !!model);
    return (filteredList.length > 0 && filteredList.map(buildOption)) || [];
  }

  applyFilters({ value }) {
    const formValues = _.mapValues(value, (option) =>
      this.isFilterOption(option) ? option.value : option
    );
    this.onApplyFilters.emit(formValues);
  }

  clearFilters() {
    this.resetForm = true;
    this.cd.detectChanges();
    this.resetForm = false;

    this.onValidationError.emit(null);
    this.onClearFilters.emit();
  }

  validationErrors(errors: ValidationError[]): void {
    this.onValidationError.emit(errors);
  }

  isFilterOption(option: any): option is FilterOption {
    return option.label !== undefined && option.value !== undefined;
  }

  updateValidity(control: string) {
    if (this.form.controls[control]) {
      this.cd.detectChanges();
      this.form.controls[control].updateValueAndValidity();
    }
  }
}
