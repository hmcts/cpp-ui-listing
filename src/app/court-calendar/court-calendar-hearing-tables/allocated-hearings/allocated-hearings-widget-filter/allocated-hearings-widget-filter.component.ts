import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  PdkButton,
  PdkCore,
  PdkDateInput,
  PdkForm,
  PdkInput,
  PdkRadio,
  SelectOption,
  ValidationError
} from '@cpp/pdk';
import {
  OrganisationUnitAutosuggestComponent,
  RotaBusinessTypeSelectComponent
} from '@cpp/reference-data';
import { AllocateWidgetFilters, CourtCalendarFilters } from '../../../model';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { JurisdictionType } from '../../../../core';

@Component({
  selector: 'allocated-hearings-widget-filter',
  templateUrl: './allocated-hearings-widget-filter.component.html',
  imports: [
    OrganisationUnitAutosuggestComponent,
    RotaBusinessTypeSelectComponent,
    OrganisationUnitAutosuggestComponent,
    FormsModule,
    PdkForm,
    PdkCore,
    PdkInput,
    PdkDateInput,
    PdkRadio,
    PdkButton,
    DatePipe
  ],
  styles: [
    `
      .grid-row {
        display: grid;
        grid-template-columns: 55% 45%;
        align-items: end;
      }

      .grid-two-row {
        display: grid;
        grid-template-columns: 80% 15%;
        align-items: end;
      }

      .border {
        border: 1px solid;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllocatedHearingsWidgetFilterComponent {
  readonly filterOptions = input<AllocateWidgetFilters>(undefined);
  readonly jurisdictionType = input<JurisdictionType>(undefined);
  readonly onSubmit = output<AllocateWidgetFilters>();
  readonly errors = output<ValidationError[] | null>();

  readonly courtSessionOptions: SelectOption<CourtCalendarFilters['courtSession'] | undefined>[] = [
    { value: 'Any', label: 'Any' },
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
    { value: 'AD', label: 'All day' }
  ];

  readonly currentDate = new Date();

  readonly isCrown = computed(() => this.jurisdictionType() === 'CROWN');

  readonly jurisdictionCode = computed(() => (this.isCrown() ? 'C' : 'B') as 'B' | 'C');

  submit({ startDate, businessType, courtSession, courtCentre }: AllocateWidgetFilters) {
    this.onSubmit.emit({
      courtCentre,
      startDate,
      businessType,
      courtSession
    });
  }
}
