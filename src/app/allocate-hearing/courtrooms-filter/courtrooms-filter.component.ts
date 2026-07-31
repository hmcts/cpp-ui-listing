import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  input,
  output
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {
  ValidationError,
  PdkTimeInputComponent,
  PdkGrid,
  PdkCore,
  PdkForm,
  PdkAutosuggest,
  PdkButton
} from '@cpp/pdk';
import * as _ from 'lodash-es';
import { CourtCentre, CourtRoom, CourtroomsFilter, FilterOption } from '../../core';
import { findDataFromSelectionValues } from '../../core/util';
import { InvalidEntryValidatorDirective } from '../../shared/invalid-entry.validator.directive';
import { DatePickerComponent } from '../../shared/components/datepicker/datepicker.component';

@Component({
  selector: 'courtrooms-filter',
  templateUrl: './courtrooms-filter.component.html',
  styleUrls: ['./courtrooms-filter.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    PdkCore,
    PdkGrid,
    FormsModule,
    PdkForm,
    PdkAutosuggest,
    InvalidEntryValidatorDirective,
    DatePickerComponent,
    PdkTimeInputComponent,
    PdkButton
  ]
})
export class CourtroomsFilterComponent implements OnChanges {
  @ViewChild('form') ngForm: NgForm;
  readonly courtCentres = input<CourtCentre[]>(undefined);
  readonly courtRooms = input<CourtRoom[]>(undefined);
  readonly preselectedOptions = input<CourtroomsFilter>(undefined);
  readonly onSelectCourtCentre = output<
    | {
        type: 'change';
      }
    | FilterOption
  >();
  readonly formErrors = output<ValidationError[]>();
  readonly onSubmit = output<CourtroomsFilter>();

  get currentCourtCentreOption() {
    if (this.selectedOptions && this.selectedOptions.courtCentreId) {
      return findDataFromSelectionValues(
        this.courtOptions,
        'value',
        this.selectedOptions,
        'courtCentreId'
      );
    }
    return null;
  }

  get currentRoomOption() {
    if (this.selectedOptions && this.selectedOptions.courtRoomId) {
      return findDataFromSelectionValues(
        this.courtRoomsOptions,
        'value',
        this.selectedOptions,
        'courtRoomId'
      );
    }
    return null;
  }

  get courtOptionsLabels() {
    return this.courtOptions.map((option) => option.label);
  }

  get courtRoomsOptionsLabels() {
    return this.courtRoomsOptions.map((option) => option.label);
  }

  courtCenterSearchValue: string;
  courtRoomSearchValue: string;
  resetCourtRooms: boolean;
  courtOptions: FilterOption[];
  courtRoomsOptions: FilterOption[] = [];
  courtCentreSuggestions: FilterOption[] = [];
  courtRoomsSuggestions: FilterOption[] = [];
  selectedOptions: CourtroomsFilter = {
    courtCentreId: null,
    courtRoomId: null,
    searchDate: null
  };

  constructor(private cd: ChangeDetectorRef) {
    this.resetCourtRooms = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.courtCentres) {
      this.courtOptions = this.buildOptions(changes.courtCentres.currentValue);
    }
    if (changes.preselectedOptions && changes.preselectedOptions.currentValue) {
      this.selectedOptions = { ...changes.preselectedOptions.currentValue };
    }
    if (changes.courtRooms) {
      this.courtRoomsOptions = [...this.buildOptions(changes.courtRooms.currentValue)];
    }
  }

  buildOptions(items: any[]): FilterOption[] {
    return items.map((item) => ({
      label: item.name,
      value: item.id
    }));
  }

  clearFilters(): void {
    this.ngForm.resetForm();
    this.formErrors.emit(null);
    this.cd.detectChanges();
  }

  onFormSubmit({ value }) {
    this.formErrors.emit(null);
    const formValues = _.mapValues(value, (option) =>
      this.isFilterOption(option) ? option.value : option
    ) as CourtroomsFilter;
    this.onSubmit.emit(formValues);
  }

  selectCourtCentre(event) {
    if (event === null) {
      this.courtCentreInputChanged();
      return;
    }
    this.selectedOptions.courtCentreId = event.value;
    this.courtCenterSearchValue = null;
    this.cd.detectChanges();
    this.ngForm.controls.courtCentreId.updateValueAndValidity();
    this.onSelectCourtCentre.emit(event);
  }

  selectCourtRoom(event) {
    if (event) {
      this.courtRoomSearchValue = null;
      this.selectedOptions.courtRoomId = event.value;
      this.cd.detectChanges();
      this.ngForm.controls.courtRoomId.updateValueAndValidity();
    }
  }

  courtCentreInputChanged(value?: string) {
    if (value) {
      this.courtCentreSuggestions = this.courtOptions.filter(
        (option) => option.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
      this.onSelectCourtCentre.emit({ type: 'change' });
    }
    this.selectedOptions.courtCentreId = null;
    this.selectedOptions.courtRoomId = null;
    this.courtCenterSearchValue = value || null;
    this.cd.detectChanges();
    this.ngForm.controls.courtCentreId.updateValueAndValidity();
  }

  courtRoomInputChanged(value: string) {
    this.courtRoomsSuggestions = this.courtRoomsOptions.filter(
      (option) => option.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
    this.courtRoomSearchValue = value;
    this.ngForm.controls.courtRoomId.updateValueAndValidity();
  }

  resetCourtRoomEntity() {
    this.courtRoomsOptions = [];
    this.ngForm.value.courtRoomId = null;
    this.resetCourtRooms = true;
    this.cd.detectChanges();
    this.resetCourtRooms = false;
  }

  isFilterOption(option: any): option is FilterOption {
    if (option) {
      return option.label !== undefined && option.value !== undefined;
    }
  }

  emitErrors(event) {
    this.formErrors.emit(event);
  }
}
