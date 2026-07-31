import {
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CaseNote } from '../../../allocate-hearing/allocate-hearing.interfaces';
import { AppConfigService } from '../../../config';
import {
  ChangeJudiciaryEvent,
  CourtRoomCalendarVM,
  CourtRoomJudicialCalendar,
  HearingRowVM
} from '../../model';
import { BaseHearingTable } from '../../model/hearing-table-renderer.interfaces';
import { getAllHearingCalendars } from '../../utils/court-calendar-hearings-helper';
import { HearingActionsEvent } from '../renderers/cell-renderers/action-cell.component';
import { DefendantCellComponent } from '../renderers/cell-renderers/defendant-cell.component';
import { HearingTypeCellComponent } from '../renderers/cell-renderers/hearing-type-cell.component';
import { OffenceWordingCellComponent } from '../renderers/cell-renderers/offence-wording-cell.component';
import { SectionTableRendererComponent } from '../renderers/section-table-renderer/section-table-renderer.component';
import { AllocatedHearingRowDetailsComponent } from './allocated-hearing-row-details/allocated-hearing-row-details.component';
import { AllocatedHearingsTableSectionHeaderPipe } from '../../pipes/allocated-hearings-table-section-header.pipe';
import {
  AllocatedTableColumnConfig,
  allocatedTableSectionConfig
} from '../../utils/table-configs/allocated-table-configs';
import {
  HearingTableActionsStore,
  MoveEvent,
  MoveState,
  PositionedHearingsState,
  SelectedHearingState,
  SequenceEvent
} from '../component-store/hearing-table-actions.store';
import { DurationCellComponent } from '../renderers/cell-renderers/duration-cell.component';
import { IsCurrentOrGreaterThanDatePipe } from '../../pipes/is-current-or-greater-date.pipe';
import { TimeCellComponent } from '../renderers/cell-renderers/time-cell.component';
import { HearingRowMovedAlertComponent } from '../renderers/cell-renderers/hearing-row-moved-alert.component';
import { AllocatedHearingsActionsCellComponent } from '../renderers/cell-renderers/allocated-hearings-actions-cell.component';
import { JudiciaryHeaderCellComponent } from '../renderers/cell-renderers/judiciary-header-cell.component';
import { AllMasterHearingsInSelectedStatePipe } from '../../pipes/all-hearings-in-selected-state.pipe';
import { HearingsAreInEligibleToSelectPipe } from '../../pipes/hearings-are-ineligible-to-select.pipe';
import { PdkPaginationComponent, PdkCheckBox, PdkCore } from '@cpp/pdk';
import { IsEligibleForEndDateChangePipe } from '../../pipes/is-eligible-for-end-date-change.pipe';

@Component({
  selector: 'allocated-hearing-table-container',
  templateUrl: './allocated-hearing-table.component.html',
  imports: [
    SectionTableRendererComponent,
    AllocatedHearingsTableSectionHeaderPipe,
    DefendantCellComponent,
    OffenceWordingCellComponent,
    FormsModule,
    AllocatedHearingsActionsCellComponent,
    HearingTypeCellComponent,
    AllocatedHearingRowDetailsComponent,
    DurationCellComponent,
    IsCurrentOrGreaterThanDatePipe,
    TimeCellComponent,
    HearingRowMovedAlertComponent,
    JudiciaryHeaderCellComponent,
    AllMasterHearingsInSelectedStatePipe,
    HearingsAreInEligibleToSelectPipe,
    PdkPaginationComponent,
    PdkCore,
    PdkCheckBox,
    IsEligibleForEndDateChangePipe
  ],
  providers: [HearingTableActionsStore],
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      allocated-hearing-table-container td.cell-border-bottom-none:nth-last-of-type(2) {
        border-bottom-style: dashed;
        border-bottom-width: 2.25px;
      }

      allocated-hearing-table-container section-table-renderer tr,
      *[section-table-renderer] tr {
        border-left: 1px solid #b1b4b6;
        border-right: 1px solid #b1b4b6;
      }

      allocated-hearing-table-container section-table-renderer thead > tr,
      *[section-table-renderer] thead > tr {
        border-top: 1px solid #b1b4b6;
      }
    `
  ]
})
export class AllocatedHearingTableContainer implements BaseHearingTable, OnChanges {
  readonly sections = input<CourtRoomCalendarVM[]>(undefined);
  readonly totalNumber = input<number>(undefined);
  readonly resultsDisplayed = input<number>(undefined);
  readonly currentPage = input(1);
  readonly pageSize = input<number>(40);
  readonly caseNotesMap = input<Record<string, CaseNote[]>>({});
  readonly hearingMovestate = input<MoveState>(undefined);
  readonly selectedHearings = input<SelectedHearingState[]>(undefined);
  readonly positionedHearingsState = input<PositionedHearingsState[]>(undefined);
  readonly failedAllocationIds = input<string[]>();
  readonly onNavigateChangeJudiciary = output<ChangeJudiciaryEvent>();
  readonly pageChange = output<number>();
  readonly onGetCaseNote = output<string>();
  readonly onSelectHearing = output<SelectedHearingState>();
  readonly onSelectAllHearings = output<SelectedHearingState[]>();
  readonly actionClicked = output<HearingActionsEvent>();
  readonly undoHearingMoveClicked = output<void>();
  readonly onSequence = output<SequenceEvent>();
  get baseUrl() {
    return this.appConfig.getBaseUrl();
  }

  allMasterHearingRows: HearingRowVM[];
  readonly sectionConfig = allocatedTableSectionConfig;
  readonly columnConfig = AllocatedTableColumnConfig;

  constructor(private appConfig: AppConfigService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sections?.currentValue?.length > 0) {
      this.allMasterHearingRows = this.getAllMasterHearingRows();
    }
  }

  selectAllHearings(event: boolean) {
    if (!event) {
      this.onSelectAllHearings.emit([]);
    } else {
      const selectedHearings = this.allMasterHearingRows
        .filter(({ isMaster }) => isMaster)
        .map(({ id, dateTime }) => ({ hearingId: id, hearingDateTime: dateTime }));
      this.onSelectAllHearings.emit(selectedHearings);
    }
  }

  select(hearing: HearingRowVM) {
    this.onSelectHearing.emit({ hearingId: hearing.id, hearingDateTime: hearing.dateTime });
  }

  isSelected(hearing: HearingRowVM) {
    return this.selectedHearings().some(
      h => h.hearingId === hearing.id && h.hearingDateTime === hearing.dateTime
    );
  }

  onHearingAction(event: HearingActionsEvent, hearingDateTime: string) {
    this.actionClicked.emit({ ...event, hearingDateTime });
  }

  onHearingMove(
    moveEvent: MoveEvent,
    { courtCentre, courtRoomId, date }: CourtRoomCalendarVM,
    hearingDateTime: string
  ) {
    this.onSequence.emit({
      ...moveEvent,
      hearingDateTime,
      courtCentre,
      courtRoomId,
      date
    });
  }

  preventDefault(event: MouseEvent) {
    event.stopPropagation();
  }

  getAllMasterHearingRows() {
    const judicialCalendars = this.sections().reduce(
      (allJudiciaryCalendars: CourtRoomJudicialCalendar[], { judiciaryCalendar }) => [
        ...allJudiciaryCalendars,
        ...judiciaryCalendar
      ],
      []
    );
    return getAllHearingCalendars(judicialCalendars).reduce(
      (allHearings: HearingRowVM[], { hearings }) => [
        ...allHearings,
        ...hearings.filter(({ isMaster, isDisabled }) => isMaster && !isDisabled)
      ],
      []
    );
  }
}
