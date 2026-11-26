import { ChangeDetectionStrategy, Component, OnInit, input, model, output } from '@angular/core';
import {
  PdkForm,
  SelectOption,
  ValidationError,
  PdkRadio,
  PdkCore,
  PdkGrid,
  PdkButton
} from '@cpp/pdk';
import { OrganisationUnit } from '@cpp/reference-data';
import { FormsModule } from '@angular/forms';

import { CourtCalendarFilters } from '../../model';
import { CourtCalendarFilterFieldsComponent } from '../court-calendar-filter-fields/court-calendar-filter-fields.component';

enum Court {
  CROWN_COURT_CODE = 'C'
}

@Component({
  selector: 'court-calendar-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './court-calendar-filters.component.html',
  styleUrls: ['./court-calendar-filters.component.scss'],
  imports: [
    FormsModule,
    PdkForm,
    PdkRadio,
    PdkCore,
    PdkGrid,
    PdkButton,
    CourtCalendarFilterFieldsComponent
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
      courtCentre?.courtrooms?.map(courtroom => ({
        value: courtroom.id,
        label: courtroom.courtroomName
      })) || [];
  }

  handleSubmitForm(values: CourtCalendarFilters): void {
    this.submitForm.emit({ ...values, pageNumber: 1 });
  }
}
