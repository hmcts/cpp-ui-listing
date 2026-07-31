import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Hearing } from '../../../core/model';
import {
  UnscheduledHearingsForAllApplications,
  UnscheduledHearingsForAllDefendants
} from '../../unscheduled-listings.interfaces';

import {
  PdkGridComponent,
  PdkGridDirective,
  PdkTableComponent,
  PdkTableHeadDirective,
  PdkTableRowDirective,
  PdkTableHeaderDirective,
  PdkTableBodyDirective,
  PdkTableCellDirective,
  PdkLinkDirective,
  PdkTypographyDirective,
  PdkMarginDirective,
  PdkPaginationComponent
} from '@cpp/pdk';
import { CPPDatePipe } from '../../../shared/pipes/cpp-date.pipe';

@Component({
  selector: 'unscheduled-listings-table',
  templateUrl: './unscheduled-listings-table.component.html',
  styleUrls: ['./unscheduled-listings-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkGridComponent,
    PdkGridDirective,
    PdkTableComponent,
    PdkTableHeadDirective,
    PdkTableRowDirective,
    PdkTableHeaderDirective,
    PdkTableBodyDirective,
    PdkTableCellDirective,
    PdkLinkDirective,
    PdkTypographyDirective,
    PdkMarginDirective,
    PdkPaginationComponent,
    CPPDatePipe
  ]
})
export class UnscheduledListingsTableComponent {
  readonly unscheduledHearings = input<UnscheduledHearingsForAllDefendants[]>(undefined);
  readonly unscheduledHearingsForApplications =
    input<UnscheduledHearingsForAllApplications[]>(undefined);
  readonly baseUrl = input<string>(undefined);
  readonly pageNumber = model(1);
  readonly pageSize = input(0);
  readonly totalResults = input(0);
  readonly onAllocate = output<Hearing>();

  allocate(hearing: Hearing): void {
    this.onAllocate.emit(hearing);
  }

  pageChanged(event: number) {
    this.pageNumber.set(event);
  }
}
