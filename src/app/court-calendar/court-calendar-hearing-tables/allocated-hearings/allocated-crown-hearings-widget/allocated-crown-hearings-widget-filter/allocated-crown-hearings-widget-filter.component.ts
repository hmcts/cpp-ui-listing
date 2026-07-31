import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PdkButton, PdkCore, PdkDateInput, PdkForm, PdkInput, ValidationError } from '@cpp/pdk';
import {
  HearingTypeAutosuggestComponent,
  OrganisationUnitAutosuggestComponent
} from '@cpp/reference-data';
import { AllocateWidgetFilters } from '../../../../model';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'allocated-crown-hearing-widget-filter',
  templateUrl: './allocated-crown-hearings-widget-filter.component.html',
  imports: [
    OrganisationUnitAutosuggestComponent,
    HearingTypeAutosuggestComponent,
    PdkForm,
    FormsModule,
    PdkDateInput,
    PdkCore,
    PdkInput,
    PdkButton,
    DatePipe
  ],
  styles: [
    `
      .border {
        border: 1px solid;
      }
      .flex {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllocatedCrownHearingsWidgetFilterComponent {
  readonly filterOptions = input<AllocateWidgetFilters>(undefined);
  readonly onSubmit = output<AllocateWidgetFilters>();
  readonly errors = output<ValidationError[] | null>();
  readonly currentDate = new Date();

  submit({ startDate, hearingType, courtCentre }: AllocateWidgetFilters) {
    this.onSubmit.emit({
      courtCentre,
      startDate,
      hearingType
    });
  }
}
