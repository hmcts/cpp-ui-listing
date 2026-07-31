import {
  Component,
  inject,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output
} from '@angular/core';
import { PdkCore, PdkGrid, ValidationError, PdkAlertComponent } from '@cpp/pdk';
import { AppConfigService } from '../../../../config';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { AllocateWidgetFilters, MagsWidgetCourtroomCalendarVm } from '../../../model';
import { BaseHearingTable } from '../../../model/hearing-table-renderer.vm';
import { DefendantCellComponent } from '../../renderers/cell-renderers/defendant-cell.component';
import { DurationCellComponent } from '../../renderers/cell-renderers/duration-cell.component';
import { HearingTypeCellComponent } from '../../renderers/cell-renderers/hearing-type-cell.component';
import { TimeCellComponent } from '../../renderers/cell-renderers/time-cell.component';
import { SectionAccordionRendererComponent } from '../../renderers/section-accordion-renderer/section-accordion-renderer.component';
import {
  allocatedHearingWidgetColumnConfig,
  allocatedMagHearingWidgetSectionConfig
} from '../../../utils/table-configs/allocated-table-configs';
import { HearingRowMovedAlertComponent } from '../../renderers/cell-renderers/hearing-row-moved-alert.component';
import { TotalHearingAndDurationTextPipe } from '../../../pipes/total-hearings-and-duration-text.pipe';
import {
  HearingTableActionsState,
  MoveEvent,
  SectionAllocatedToState,
  SelectedHearingState,
  SequenceEvent
} from '../../component-store/hearing-table-actions.store';
import { getAllHearingCalendars } from '../../../utils/court-calendar-hearings-helper';
import { asapScheduler } from 'rxjs';
import { BusinessHeaderCellComponent } from '../../renderers/cell-renderers/business-header-cell.component';
import { ViewHearingRowDetailsComponent } from '../../shared/view-hearing-row-details/view-hearing-row-details.component';
import { AllocatedMagistratesHearingsWidgetFilterComponent } from './allocated-magistrates-hearings-widget-filter/allocated-magistrates-hearings-widget-filter.component';
import { RotaBusinessType } from '@cpp/reference-data';
import { AllocatedMagistratesMoveActionsCellComponent } from '../../renderers/cell-renderers/allocated-magistrates-move-action-cell.component';
import { BusinessTypeTotalHearingsSummaryPipe } from '../../../pipes/business-type-total-hearings-summary.pipe';
import { NoSessionSlotAvaliablePipe } from '../../../pipes/no-session-slot-avaliable.pipe';
import { CourtSession } from '@cpp/scheduling';
import { NgPlural, NgPluralCase } from '@angular/common';
import { HearingActionsEvent } from '../../renderers/cell-renderers/action-cell.component';

@Component({
  selector: 'allocated-magistrates-hearing-widget',
  templateUrl: './allocated-magistrates-hearings-widget.component.html',
  providers: [TotalHearingAndDurationTextPipe],
  imports: [
    AllocatedMagistratesHearingsWidgetFilterComponent,
    SectionAccordionRendererComponent,
    TimeCellComponent,
    DurationCellComponent,
    HearingTypeCellComponent,
    DefendantCellComponent,
    HearingRowMovedAlertComponent,
    BusinessHeaderCellComponent,
    ViewHearingRowDetailsComponent,
    AllocatedMagistratesMoveActionsCellComponent,
    BusinessTypeTotalHearingsSummaryPipe,
    NoSessionSlotAvaliablePipe,
    PdkGrid,
    PdkCore,
    PdkAlertComponent,
    NgPlural,
    NgPluralCase
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      allocated-magistrates-hearing-widget
        section-table-renderer
        table
        > tbody:last-child
        > tr:last-child
        > td,
      allocated-magistrates-hearing-widget
        *[section-table-renderer]
        table
        > tbody:last-child
        > tr:last-child
        > td {
        border-bottom: none;
      }
      pdk-accordion {
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class AllocatedMagistratesHearingsWidgetComponent
  implements
    BaseHearingTable<MagsWidgetCourtroomCalendarVm, 'businessTypeCalendar', 'hearingTimeCalendar'>,
    OnChanges
{
  readonly sections = input<MagsWidgetCourtroomCalendarVm[]>(undefined);
  readonly filterOptions = input<AllocateWidgetFilters>(undefined);
  readonly caseNotesMap = input<Record<string, CaseNote[]>>({});
  readonly hearingMoveState = input<HearingTableActionsState['moveState']>(undefined);
  readonly positionedHearingsState =
    input<HearingTableActionsState['positionedHearingsState']>(undefined);
  readonly selectedAllocationHearings = input<SelectedHearingState[]>([]);
  readonly sectionAllocatedToState = input<SectionAllocatedToState>(undefined);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly onSubmit = output<AllocateWidgetFilters>();
  readonly errors = output<ValidationError[] | null>();
  readonly onGetCaseNote = output<string>();
  readonly actionClicked = output<HearingActionsEvent>();
  readonly undoHearingMoveClicked = output<void>();
  readonly onSequence = output<SequenceEvent>();
  readonly onAllocate = output<{
    section: MagsWidgetCourtroomCalendarVm;
    courtScheduleId: string;
    session: CourtSession;
  }>();
  get baseUrl() {
    return this.appConfig.getBaseUrl();
  }
  sectionOpenState: number[] = [];
  sectionAllocatedTo: MagsWidgetCourtroomCalendarVm;
  readonly sectionConfig = allocatedMagHearingWidgetSectionConfig;
  readonly columnConfig = allocatedHearingWidgetColumnConfig;
  private readonly totalHearingsAndDurationText = inject(TotalHearingAndDurationTextPipe);
  private readonly appConfig = inject(AppConfigService);
  readonly sectionTitleResolver = ({
    courtRoomName,
    businessTypeCalendar
  }: MagsWidgetCourtroomCalendarVm) => {
    const hearingCalendars = getAllHearingCalendars(businessTypeCalendar);
    const durationAndHearings = this.totalHearingsAndDurationText.transform(hearingCalendars);
    return `${courtRoomName} ${durationAndHearings}`;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.selectedAllocationHearings &&
      !changes.selectedAllocationHearings.isFirstChange()
    ) {
      this.applyAllocationChanges();
    }

    if (changes?.sectionAllocatedToState?.currentValue) {
      this.applyAllocationSuccessChanges();
    }
  }

  allocate(
    section: MagsWidgetCourtroomCalendarVm,
    eventPayload: {
      session: CourtSession;
      courtScheduleId: string;
    }
  ) {
    this.onAllocate.emit({
      ...eventPayload,
      section
    });
  }

  onAccordionOpenChange(openSections: number[]) {
    this.sectionOpenState = [...openSections];
  }

  onHearingMove(
    moveEvent: MoveEvent,
    { courtCentre, courtRoomId, date }: MagsWidgetCourtroomCalendarVm,
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
  private applyAllocationChanges() {
    if (this.selectedAllocationHearings().length > 0) {
      this.onAccordionOpenChange(Array.from(this.sections().keys()));
    } else if (!!this.sectionAllocatedToState()) {
      const sectionAllocatedToIndex = this.sections().findIndex(
        ({ courtRoomId }) => courtRoomId === this.sectionAllocatedToState().courtRoomId
      );
      this.onAccordionOpenChange([sectionAllocatedToIndex]);
    } else {
      this.onAccordionOpenChange([]);
    }
  }

  private applyAllocationSuccessChanges() {
    this.sectionAllocatedTo = this.sections().find(
      ({ courtRoomId }) => this.sectionAllocatedToState().courtRoomId === courtRoomId
    );
    asapScheduler.schedule(() => {
      const section = document.getElementById(this.sectionAllocatedTo.sectionIdentifier);
      if (section && section.scrollIntoView) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
