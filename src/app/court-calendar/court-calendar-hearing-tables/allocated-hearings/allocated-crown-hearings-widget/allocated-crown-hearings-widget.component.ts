import {
  Component,
  inject,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output
} from '@angular/core';
import { PdkButton, PdkCore, PdkGrid, ValidationError, PdkAlertComponent } from '@cpp/pdk';
import { AppConfigService } from '../../../../config';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import {
  AllocateWidgetFilters,
  CourtRoomCalendarVM,
  CourtRoomHearingTimeCalendar
} from '../../../model';
import { BaseHearingTable } from '../../../model/hearing-table-renderer.vm';
import { DefendantCellComponent } from '../../renderers/cell-renderers/defendant-cell.component';
import { DurationCellComponent } from '../../renderers/cell-renderers/duration-cell.component';
import { HearingTypeCellComponent } from '../../renderers/cell-renderers/hearing-type-cell.component';
import { TimeCellComponent } from '../../renderers/cell-renderers/time-cell.component';
import { SectionAccordionRendererComponent } from '../../renderers/section-accordion-renderer/section-accordion-renderer.component';
import {
  allocatedHearingWidgetColumnConfig,
  allocatedCrownHearingWidgetSectionConfig
} from '../../../utils/table-configs/allocated-table-configs';
import { AllocatedCrownHearingsWidgetFilterComponent } from './allocated-crown-hearings-widget-filter/allocated-crown-hearings-widget-filter.component';
import { HearingRowMovedAlertComponent } from '../../renderers/cell-renderers/hearing-row-moved-alert.component';
import { TotalHearingAndDurationTextPipe } from '../../../pipes/total-hearings-and-duration-text.pipe';
import { AllocatedCrownWidgetActionsCellComponent } from '../../renderers/cell-renderers/allocated-crown-widget-actions-cell.component';
import {
  AllocateMoveEvent,
  HearingTableActionsState,
  MoveEvent,
  SectionAllocatedToState,
  SelectedHearingState,
  SequenceEvent
} from '../../component-store/hearing-table-actions.store';
import { DisplayAllocateForHearingTimeGroupPipe } from '../../../pipes/display-allocate-options-for-time-group.pipe';
import { DisplayCourtRoomAllocatePipe } from '../../../pipes/display-courtroom-allocate.pipe';
import { getAllHearingCalendars } from '../../../utils/court-calendar-hearings-helper';
import { asapScheduler } from 'rxjs';
import { JudiciaryHeaderCellComponent } from '../../renderers/cell-renderers/judiciary-header-cell.component';
import { ViewHearingRowDetailsComponent } from '../../shared/view-hearing-row-details/view-hearing-row-details.component';
import { NgPlural, NgPluralCase } from '@angular/common';
import { HearingActionsEvent } from '../../renderers/cell-renderers/action-cell.component';
import { ExtendedJudicialRole } from 'src/app/core';

@Component({
  selector: 'allocated-crown-hearing-widget',
  templateUrl: './allocated-crown-hearings-widget.component.html',
  providers: [TotalHearingAndDurationTextPipe],
  imports: [
    AllocatedCrownHearingsWidgetFilterComponent,
    SectionAccordionRendererComponent,
    TimeCellComponent,
    DurationCellComponent,
    HearingTypeCellComponent,
    DefendantCellComponent,
    HearingRowMovedAlertComponent,
    AllocatedCrownWidgetActionsCellComponent,
    DisplayAllocateForHearingTimeGroupPipe,
    DisplayCourtRoomAllocatePipe,
    JudiciaryHeaderCellComponent,
    ViewHearingRowDetailsComponent,
    PdkGrid,
    PdkCore,
    PdkButton,
    PdkAlertComponent,
    NgPlural,
    NgPluralCase
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      allocated-crown-hearing-widget
        section-table-renderer
        table
        > tbody:last-child
        > tr:last-child
        > td,
      allocated-crown-hearing-widget
        *[section-table-renderer]
        table
        > tbody:last-child
        > tr:last-child
        > td {
        border-bottom: none;
      }
    `
  ]
})
export class AllocatedCrownHearingsWidgetComponent
  implements
    BaseHearingTable<CourtRoomCalendarVM, 'judiciaryCalendar', 'hearingTimeCalendar'>,
    OnChanges
{
  readonly sections = input<CourtRoomCalendarVM[]>(undefined);
  readonly filterOptions = input<AllocateWidgetFilters>(undefined);
  readonly caseNotesMap = input<Record<string, CaseNote[]>>({});
  readonly hearingMoveState = input<HearingTableActionsState['moveState']>(undefined);
  readonly positionedHearingsState =
    input<HearingTableActionsState['positionedHearingsState']>(undefined);
  readonly selectedAllocationHearings = input<SelectedHearingState[]>([]);
  readonly sectionAllocatedToState = input<SectionAllocatedToState>(undefined);
  readonly onSubmit = output<AllocateWidgetFilters>();
  readonly errors = output<ValidationError[] | null>();
  readonly onGetCaseNote = output<string>();
  readonly actionClicked = output<HearingActionsEvent>();
  readonly undoHearingMoveClicked = output<void>();
  readonly onSequence = output<SequenceEvent>();
  readonly onAllocateAndMove = output<AllocateMoveEvent>();
  get baseUrl() {
    return this.appConfig.getBaseUrl();
  }
  sectionOpenState: number[] = [];
  sectionAllocatedTo: CourtRoomCalendarVM;
  readonly sectionConfig = allocatedCrownHearingWidgetSectionConfig;
  readonly columnConfig = allocatedHearingWidgetColumnConfig;
  private readonly totalHearingsAndDurationText = inject(TotalHearingAndDurationTextPipe);
  private readonly appConfig = inject(AppConfigService);
  readonly sectionTitleResolver = ({ courtRoomName, judiciaryCalendar }: CourtRoomCalendarVM) => {
    const hearingCalendars = getAllHearingCalendars(judiciaryCalendar);
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

  allocateAndMove(
    section: CourtRoomCalendarVM,
    hearingDateTime?: string,
    judiciaryToallocate?: ExtendedJudicialRole[],
    event?: MoveEvent
  ) {
    let flattenedTimegroup: CourtRoomHearingTimeCalendar = undefined;
    // The system currently has no way of validating or stopping different judiciary group allocation to the same courtroom
    //  and same time. This is intended to be fixed moving forward by either providing a crown court schedule that allows
    // judiciary group allocation to specific courtrooms at all times or a validation that will stop listing of allocated hearings
    // with different judiciary groups per hearings group at the same time (e.g multiple 10:00 am hearings allocated to different judiciary groups).
    // The temporary fix below will assume that human error can be made and we could have multiple hearings assigned to different judiciary groups at the same time.
    // The judiciary groups will be ignored and hearing groups scheduled for specific time will be flattened and resequenced.
    // Once validation is implemented, we revert to passing the group as the source of integrity for sequencing
    if (hearingDateTime) {
      flattenedTimegroup = getAllHearingCalendars(
        section.judiciaryCalendar,
        (timeCalendar) => timeCalendar.time === hearingDateTime
      ).reduce((requiredTimeGroup, { time, hearings }) => {
        return {
          time: hearingDateTime,
          hearings: [...(requiredTimeGroup.hearings ?? []), ...hearings]
        };
      }, {} as CourtRoomHearingTimeCalendar);
    }

    this.onAllocateAndMove.emit({
      ...(event || {}),
      section,
      group: flattenedTimegroup,
      judiciaryToallocate
    });
  }

  onAccordionOpenChange(openSections: number[]) {
    this.sectionOpenState = [...openSections];
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
