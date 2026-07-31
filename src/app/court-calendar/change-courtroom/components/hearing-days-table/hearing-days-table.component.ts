import { Component, OnInit, input, output } from '@angular/core';
import { PdkCheckBox, PdkTable, SelectOption, PdkPaginationComponent, PdkCore } from '@cpp/pdk';
import { CourtRoomNamePipe } from '../../../../shared/pipes/court-room-name.pipe';
import { AllHearingDaysSelectedPipe } from '../../../../shared/pipes/all-hearing-days-selected.pipe';
import { HearingDayVM } from '../../../../court-calendar/model';
import { DurationCellComponent } from '../../../../court-calendar/court-calendar-hearing-tables/renderers/cell-renderers/duration-cell.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

export interface SelectAllhearingDaysEvent {
  allSelected: boolean;
  paginatedHearingDates: string[];
}

@Component({
  selector: 'hearing-days-table',
  templateUrl: './hearing-days-table.component.html',
  imports: [
    DurationCellComponent,
    CourtRoomNamePipe,
    AllHearingDaysSelectedPipe,
    PdkTable,
    PdkCheckBox,
    PdkCore,
    FormsModule,
    PdkPaginationComponent,
    DatePipe
  ]
})
export class HearingDaysTableComponent implements OnInit {
  readonly isPreview = input(false);
  readonly courtRoomOptions = input<SelectOption<string>[]>([]);
  readonly totalNumberofHearingDays = input(0);
  readonly pageSize = 10;
  readonly allUpcomingHearingDays = input<HearingDayVM[]>([]);
  readonly selectedHearingDays = input<HearingDayVM[]>([]);
  readonly courtCentreName = input<string>('');
  readonly allSelectedHearingDates = input<string[]>([]);
  currentPage = 1;
  currentPageHearingDays: HearingDayVM[];

  readonly pageChange = output<number>();
  readonly onSelectAllPaginatedHearing = output<SelectAllhearingDaysEvent>();
  private _tableDataSource: HearingDayVM[];

  get allCurrentPageDates() {
    return this.currentPageHearingDays?.map(({ hearingDate }) => hearingDate);
  }
  get allHearingDaysSelected() {
    return this.allCurrentPageDates?.every((date) =>
      this.allSelectedHearingDates()?.includes(date)
    );
  }

  ngOnInit() {
    this._tableDataSource =
      (this.isPreview() ? this.selectedHearingDays() : this.allUpcomingHearingDays()) ?? [];
    this.updatePagedHearingDays();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePagedHearingDays();
  }

  updatePagedHearingDays() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.currentPageHearingDays = this._tableDataSource.slice(start, start + this.pageSize);
  }

  get showPagination(): boolean {
    return this.isPreview()
      ? this.selectedHearingDays().length > this.pageSize
      : this.allUpcomingHearingDays().length > this.pageSize;
  }

  get totalResults(): number {
    return this.isPreview()
      ? this.selectedHearingDays().length
      : this.allUpcomingHearingDays().length;
  }
}
