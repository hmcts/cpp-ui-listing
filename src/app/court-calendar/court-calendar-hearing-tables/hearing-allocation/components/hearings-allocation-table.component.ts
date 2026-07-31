import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
  input,
  model,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { AppConfigService } from '../../../../config';
import {
  AllocationHearingsSectionVm,
  AllocationType,
  CourtRoomHearingTimeCalendar,
  HearingRowVM
} from '../../../model';
import {
  BaseHearingTable,
  HearingsColumnConfig,
  HearingsTableSectionConfig
} from '../../../model/hearing-table-renderer.interfaces';
import { DefendantCellComponent } from '../../renderers/cell-renderers/defendant-cell.component';
import { HearingTypeCellComponent } from '../../renderers/cell-renderers/hearing-type-cell.component';
import { SectionTableRendererComponent } from '../../renderers/section-table-renderer/section-table-renderer.component';
import { DurationCellComponent } from '../../renderers/cell-renderers/duration-cell.component';
import { TimeCellComponent } from '../../renderers/cell-renderers/time-cell.component';
import {
  AllocationHearingsTableColumnConfig,
  AllocationHearingsTableSectionConfig
} from '../../../utils/table-configs/hearing-allocation-table-config';
import { SelectedHearingState } from '../../component-store/hearing-table-actions.store';
import { AllMasterHearingsInSelectedStatePipe } from '../../../pipes/all-hearings-in-selected-state.pipe';
import { ViewHearingRowDetailsComponent } from '../../shared/view-hearing-row-details/view-hearing-row-details.component';
import { PageSizeSelectorComponent } from '../../../../shared/components/page-size-selector/page-size-selector.component';
import { Hearing } from '../../../../core';
import { PdkPaginationComponent, PdkCheckBox, PdkCore } from '@cpp/pdk';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'hearings-allocation-table-component',
  templateUrl: './hearings-allocation-table.component.html',
  imports: [
    SectionTableRendererComponent,
    DefendantCellComponent,
    FormsModule,
    HearingTypeCellComponent,
    DurationCellComponent,
    TimeCellComponent,
    AllMasterHearingsInSelectedStatePipe,
    ViewHearingRowDetailsComponent,
    PdkPaginationComponent,
    PdkCore,
    PdkCheckBox,
    NgTemplateOutlet,
    DatePipe,
    PageSizeSelectorComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      hearings-allocation-table-component section-table-renderer tr,
      hearings-allocation-table-component *[section-table-renderer] tr {
        border-left: 1px solid #b1b4b6;
        border-right: 1px solid #b1b4b6;
      }

      hearings-allocation-table-component section-table-renderer thead > tr,
      hearings-allocation-table-component *[section-table-renderer] thead > tr {
        border-top: 1px solid #b1b4b6;
      }
    `
  ]
})
export class HearingsAllocationTableComponent implements BaseHearingTable, OnChanges, OnInit {
  readonly sections = input<AllocationHearingsSectionVm[]>(undefined);
  readonly allocationType = input<AllocationType>(undefined);
  readonly selectedHearings = input<SelectedHearingState[]>([]);
  readonly totalNumber = input<number>(undefined);
  readonly currentPage = input(1);
  readonly caseNotesMap = input<Record<string, CaseNote[]>>({});
  readonly pageSize = model<number>(40);
  readonly pageChange = output<{
    pageNumber: number;
    pageSize?: number;
  }>();
  readonly onGetCaseNote = output<string>();
  readonly onUpdateHearingPublicListNote = output<Hearing>();
  readonly onSelectHearing = output<SelectedHearingState>();
  readonly onSelectAllHearings = output<SelectedHearingState[]>();
  get baseUrl() {
    return this.appConfig.getBaseUrl();
  }

  get isUnallocatedType() {
    return this.allocationType() === AllocationType.allocate;
  }

  allMasterHearingRows: HearingRowVM[];

  constructor(private appConfig: AppConfigService) {}
  sectionConfig?: HearingsTableSectionConfig;
  columnConfig: HearingsColumnConfig<HearingRowVM>;

  ngOnInit(): void {
    this.sectionConfig = AllocationHearingsTableSectionConfig;
    this.columnConfig = AllocationHearingsTableColumnConfig(this.allocationType());
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sections?.currentValue?.length > 0) {
      this.allMasterHearingRows = this.getAllMasterHearingRows();
    }
  }

  selectAllHearings(event: boolean) {
    if (!event) {
      this.onSelectAllHearings.emit([]);
    } else {
      const selectedHearings = this.allMasterHearingRows.map(({ id, dateTime, duration }) => ({
        hearingId: id,
        hearingDateTime: dateTime,
        duration
      }));
      this.onSelectAllHearings.emit(selectedHearings);
    }
  }

  select(hearing: HearingRowVM) {
    this.onSelectHearing.emit({
      hearingId: hearing.id,
      hearingDateTime: hearing.dateTime,
      duration: hearing.duration
    });
  }

  isSelected(hearing: HearingRowVM) {
    return this.selectedHearings().some(
      h => h.hearingId === hearing.id && h.hearingDateTime === hearing.dateTime
    );
  }

  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }

  getAllMasterHearingRows(): HearingRowVM[] {
    const hearingCalendars = this.sections().reduce(
      (calendars: CourtRoomHearingTimeCalendar[], { allocationCalendar }) => [
        ...calendars,
        ...allocationCalendar.hearingTimeCalendar
      ],
      []
    );
    return hearingCalendars.reduce(
      (allHearings: HearingRowVM[], { hearings }) => [
        ...allHearings,
        ...hearings.filter(({ isMaster }) => isMaster)
      ],
      []
    );
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.pageChange.emit({ pageNumber: 1, pageSize });
  }
}
