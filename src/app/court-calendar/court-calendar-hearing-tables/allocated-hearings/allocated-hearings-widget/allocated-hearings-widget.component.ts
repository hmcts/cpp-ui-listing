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
import {
  AllocatedWidgetCourtroomCalendarVm,
  AllocateWidgetFilters,
  CourtRoomJudicialCalendar
} from '../../../model';
import { BaseHearingTable } from '../../../model/hearing-table-renderer.interfaces';
import { DefendantCellComponent } from '../../renderers/cell-renderers/defendant-cell.component';
import { DurationCellComponent } from '../../renderers/cell-renderers/duration-cell.component';
import { HearingTypeCellComponent } from '../../renderers/cell-renderers/hearing-type-cell.component';
import { TimeCellComponent } from '../../renderers/cell-renderers/time-cell.component';
import { SectionAccordionRendererComponent } from '../../renderers/section-accordion-renderer/section-accordion-renderer.component';
import {
  allocatedHearingWidgetColumnConfig,
  allocatedWidgetSectionConfig
} from '../../../utils/table-configs/allocated-table-configs';
import { HearingRowMovedAlertComponent } from '../../renderers/cell-renderers/hearing-row-moved-alert.component';
import { TotalHearingAndDurationTextPipe } from '../../../pipes/total-hearings-and-duration-text.pipe';
import {
  SectionAllocatedToState,
  SelectedHearingState,
  PositionedHearingsState
} from '../../component-store/hearing-table-actions.store';
import { getAllHearingCalendars } from '../../../utils/court-calendar-hearings-helper';
import { asapScheduler } from 'rxjs';
import { BusinessSessionHeaderCellComponent } from '../../renderers/cell-renderers/business-session-header-cell.component';
import { JudiciaryHeaderCellComponent } from '../../renderers/cell-renderers/judiciary-header-cell.component';
import { ViewHearingRowDetailsComponent } from '../../shared/view-hearing-row-details/view-hearing-row-details.component';
import { AllocatedHearingsWidgetFilterComponent } from '../allocated-hearings-widget-filter/allocated-hearings-widget-filter.component';
import { RotaBusinessType, RotaBusinessTypeCode } from '@cpp/reference-data';
import { AllocatedCrownWidgetActionsCellComponent } from '../../renderers/cell-renderers/allocated-crown-widget-actions-cell.component';
import { BusinessTypeTotalHearingsSummaryPipe } from '../../../pipes/business-type-total-hearings-summary.pipe';
import { NoSessionSlotAvaliablePipe } from '../../../pipes/no-session-slot-avaliable.pipe';
import { CourtSession } from '@cpp/scheduling';
import { NgPlural, NgPluralCase } from '@angular/common';
import { Hearing, JurisdictionType } from '../../../../core';

@Component({
  selector: 'allocated-hearings-widget',
  templateUrl: './allocated-hearings-widget.component.html',
  providers: [TotalHearingAndDurationTextPipe],
  imports: [
    AllocatedHearingsWidgetFilterComponent,
    SectionAccordionRendererComponent,
    TimeCellComponent,
    DurationCellComponent,
    HearingTypeCellComponent,
    DefendantCellComponent,
    HearingRowMovedAlertComponent,
    BusinessSessionHeaderCellComponent,
    JudiciaryHeaderCellComponent,
    ViewHearingRowDetailsComponent,
    AllocatedCrownWidgetActionsCellComponent,
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
      allocated-hearings-widget
        section-table-renderer
        table
        > tbody:last-child
        > tr:last-child
        > td,
      allocated-hearings-widget
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
export class AllocatedHearingsWidgetComponent implements BaseHearingTable, OnChanges {
  readonly sections = input<AllocatedWidgetCourtroomCalendarVm[]>(undefined);
  readonly filterOptions = input<AllocateWidgetFilters>(undefined);
  readonly caseNotesMap = input<Record<string, CaseNote[]>>({});
  readonly selectedAllocationHearings = input<SelectedHearingState[]>([]);
  readonly eligibleScheduleIds = input<string[] | null | undefined>(null);
  readonly sectionAllocatedToState = input<SectionAllocatedToState>(undefined);
  readonly positionedHearingsState = input<PositionedHearingsState>(undefined);
  readonly failedAllocationIds = input<string[]>();
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly jurisdictionType = input<JurisdictionType>(undefined);

  readonly onSubmit = output<AllocateWidgetFilters>();
  readonly errors = output<ValidationError[] | null>();
  readonly onGetCaseNote = output<string>();
  readonly onUnallocate = output<Hearing>();
  readonly onAllocate = output<{
    section: AllocatedWidgetCourtroomCalendarVm;
    courtScheduleId: string;
    session: CourtSession;
  }>();
  get isCrown(): boolean {
    return this.jurisdictionType() === 'CROWN';
  }

  get baseUrl() {
    return this.appConfig.getBaseUrl();
  }

  sectionOpenState: number[] = [];
  sectionAllocatedTo: AllocatedWidgetCourtroomCalendarVm;
  readonly sectionConfig = allocatedWidgetSectionConfig;
  readonly columnConfig = allocatedHearingWidgetColumnConfig;
  private readonly totalHearingsAndDurationText = inject(TotalHearingAndDurationTextPipe);
  private readonly appConfig = inject(AppConfigService);

  readonly sectionTitleResolver = ({
    courtRoomName,
    businessTypeCalendar
  }: AllocatedWidgetCourtroomCalendarVm) => {
    const judiciaryCalendars = this.flatJudiciaryCalendars({
      businessTypeCalendar
    } as AllocatedWidgetCourtroomCalendarVm);
    const hearingCalendars = getAllHearingCalendars(judiciaryCalendars);
    return `${courtRoomName} ${this.totalHearingsAndDurationText.transform(hearingCalendars)}`;
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

  flatJudiciaryCalendars(section: AllocatedWidgetCourtroomCalendarVm): CourtRoomJudicialCalendar[] {
    return (section.businessTypeCalendar ?? [])
      .flatMap(bt => bt.sessions)
      .flatMap(s => s.judiciaryCalendar);
  }

  allocate(
    section: AllocatedWidgetCourtroomCalendarVm,
    eventPayload: { session: CourtSession; courtScheduleId: string }
  ) {
    this.onAllocate.emit({ ...eventPayload, section });
  }

  onAccordionOpenChange(openSections: number[]) {
    this.sectionOpenState = [...openSections];
  }

  businessTypeLabel(businessType: RotaBusinessTypeCode): string {
    return (
      this.rotaBusinessTypes().find(bt => bt.typeCode === businessType)?.typeDescription ??
      businessType
    );
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
