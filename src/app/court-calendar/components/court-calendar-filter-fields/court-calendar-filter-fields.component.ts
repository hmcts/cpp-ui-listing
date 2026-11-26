import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import {
  PdkForm,
  PdkInsetTextComponent,
  PdkRadio,
  PdkCore,
  PdkSelectComponent,
  PdkDateInput,
  PdkDatePicker,
  SelectOption
} from '@cpp/pdk';
import { CppReferenceDataComponents, OrganisationUnit } from '@cpp/reference-data';
import moment from 'moment';

import { CourtCalendarFilters } from '../../model';

@Component({
  selector: 'court-calendar-filter-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './court-calendar-filter-fields.component.html',
  styleUrls: ['./court-calendar-filter-fields.component.scss'],
  imports: [
    CppReferenceDataComponents,
    DatePipe,
    FormsModule,
    PdkForm,
    PdkInsetTextComponent,
    PdkRadio,
    PdkCore,
    PdkSelectComponent,
    PdkDateInput,
    PdkDatePicker
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class CourtCalendarFilterFieldsComponent {
  readonly courtType = input.required<'CROWN' | 'MAGISTRATES'>();
  readonly values = input<CourtCalendarFilters>();
  readonly courtroomOptions = input<SelectOption<string>[]>([]);

  readonly courtCentreChange = output<OrganisationUnit>();

  readonly jurisdictionCode = computed(() => (this.courtType() === 'CROWN' ? 'C' : 'B'));

  readonly courtSessionOptions: SelectOption<CourtCalendarFilters['courtSession'] | undefined>[] = [
    { value: 'Any', label: 'Any' },
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
    { value: 'AD', label: 'All day' }
  ];

  disabledEndDate = (startDate: string) => (date: Date) => {
    const dateMoment = moment(date);
    return dateMoment.isAfter(moment(startDate).add(2, 'weeks'));
  };
}
