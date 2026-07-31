import { ChangeDetectionStrategy, Component, OnInit, input, model, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  PdkForm,
  SelectOption,
  ValidationError,
  PdkInsetTextComponent,
  PdkRadio,
  PdkCore,
  PdkSelectComponent,
  PdkGrid,
  PdkDateInput,
  PdkDatePicker,
  PdkButton
} from '@cpp/pdk';
import { CppReferenceDataComponents, OrganisationUnit } from '@cpp/reference-data';
import moment from 'moment';

import { CourtCalendarFilters } from '../../model';
import { FormsModule } from '@angular/forms';

enum Court {
  CROWN_COURT = 'CROWN',
  MAGISTRATES_COURT = 'MAGISTRATES',
  CROWN_COURT_CODE = 'C',
  MAGS_COURT_CODE = 'B'
}

@Component({
  selector: 'court-calendar-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './court-calendar-filters.component.html',
  styleUrls: ['./court-calendar-filters.component.scss'],
  imports: [
    CppReferenceDataComponents,
    DatePipe,
    PdkForm,
    FormsModule,
    PdkInsetTextComponent,
    PdkRadio,
    PdkCore,
    PdkSelectComponent,
    PdkGrid,
    PdkDateInput,
    PdkDatePicker,
    PdkButton
  ]
})
export class CourtCalendarFiltersComponent implements OnInit {
  readonly organisationUnits = input<OrganisationUnit[]>(undefined);
  readonly initialValues = model.required<CourtCalendarFilters>();

  readonly submitForm = output<CourtCalendarFilters>();
  readonly jurisdictionTypeChange = output<void>();
  readonly errors = output<ValidationError[] | null>();

  courtType: 'CROWN' | 'MAGISTRATES';
  courtroomOptions: SelectOption<string>[] = [];
  hasCrownCourt: boolean = false;

  startDateLabel: string;
  endDateLabel: string;
  courtSessionOptions: SelectOption<CourtCalendarFilters['courtSession'] | undefined>[] = [
    { value: 'Any', label: 'Any' },
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
    { value: 'AD', label: 'All day' }
  ];

  ngOnInit(): void {
    const initialValues = this.initialValues();
    this.courtType = initialValues.courtType;

    if (initialValues.courtCentre) {
      this.handleCourtCentreChange(initialValues.courtCentre);
    }
  }

  onJurisdictionChange(): void {
    this.courtroomOptions = [];

    this.initialValues.set({
      courtCentre: null,
      businessType: null,
      courtRoomId: null,
      startDate: new Date().toISOString(),
      endDate: null,
      courtSession: null,
      hearingType: null
    });
    // TODO: The 'emit' function requires a mandatory void argument
    this.jurisdictionTypeChange.emit();
  }

  handleCourtCentreChange(courtCentre: OrganisationUnit): void {
    this.hasCrownCourt = courtCentre?.oucodeL1Code === Court.CROWN_COURT_CODE;
    this.courtroomOptions =
      courtCentre?.courtrooms?.map((courtroom) => ({
        value: courtroom.id,
        label: courtroom.courtroomName
      })) || [];
  }

  isDateDisabled = (startDate: string) => (date: Date) => {
    const twoWeeksFromStartDate = moment(startDate).add(2, 'weeks');
    return moment(date).isAfter(twoWeeksFromStartDate);
  };

  handleSubmitForm(values: CourtCalendarFilters): void {
    const filters = {
      ...values,
      pageNumber: 1
    };
    this.submitForm.emit(filters);
  }
}
