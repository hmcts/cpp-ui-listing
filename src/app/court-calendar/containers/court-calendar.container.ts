import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  untracked,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { getOrganisationUnits } from '@cpp/reference-data';
import {
  ModalService,
  PdkErrorSummaryComponent,
  PdkButton,
  PdkCore,
  PdkGrid,
  provideModalServices,
  ValidationError
} from '@cpp/pdk';
import { CourtCalendarFiltersComponent, CourtResultSummaryComponent } from '../components';
import { CourtCalendarFilters } from '../model';
import {
  CourtCalendarActions,
  CourtCalendarFeatureState,
  getCourtCalendarFilters,
  getCourtCalendarVM,
  getCaseNotesMap,
  getAllocatedHearings,
  getCourtCalendarAlert
} from '../state';
import { AllocatedHearingTableContainer } from '../court-calendar-hearing-tables/allocated-hearings/allocated-hearing-table.component';
import {
  HearingBulkActions,
  HearingDropdownActions
} from '../court-calendar-hearing-tables/shared/hearing-row-actions-dropdown/hearing-row-actions-dropdown.component';
import { ClearAllocatedHearingsAction } from '../../core';
import {
  resetAllocatedHearings,
  setSelectedHearingData,
  setAlertMessage,
  setHearingsToReallocate
} from '../state/actions/court-calendar.actions';
import { ListingNoteContainerComponent } from '@cpp/scheduling';
import {
  HearingTableActionsStore,
  SelectedHearingState,
  SequenceEvent
} from '../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { HearingActionsEvent } from '../court-calendar-hearing-tables/renderers/cell-renderers/action-cell.component';
import { CourtCalendarAlertComponent } from '../components/court-calendar-alert.component';
import { COURT_CALENDAR_ALERTS } from '../utils/court-calendar-alert-messages';
import { BulkActionsComponent } from '../components/bulk-actions/bulk-actions.component';
import { uniq } from 'lodash-es';
import { SubMenuComponent } from '../../shared/components/sub-menu/sub-menu.component';
import { PageSizeSelectorComponent } from '../../shared/components/page-size-selector/page-size-selector.component';
import { BaseHearingRowDataVM } from '../model/hearing-table-renderer.interfaces';
import { Hearing } from '../../core';
import {
  ChangeEndDateModalComponent,
  ChangeEndDateModalData
} from '../court-calendar-hearing-tables/shared/modals/change-end-date-modal.component';

@Component({
  selector: 'court-calendar-container',
  templateUrl: './court-calendar.container.html',
  imports: [
    PdkGrid,
    PdkCore,
    PdkButton,
    PdkErrorSummaryComponent,
    ListingNoteContainerComponent,
    CourtCalendarFiltersComponent,
    CourtResultSummaryComponent,
    AllocatedHearingTableContainer,
    CourtCalendarAlertComponent,
    BulkActionsComponent,
    SubMenuComponent,
    PageSizeSelectorComponent
  ],
  providers: [HearingTableActionsStore, provideModalServices()]
})
export class CourtCalendarContainer implements OnInit {
  private readonly store = inject(Store<CourtCalendarFeatureState>);
  private readonly route = inject(Router);
  private readonly modalService = inject(ModalService);
  readonly allocatedHearingActionsStore = inject(HearingTableActionsStore);

  private readonly _rawFilterOptions = this.store.selectSignal(getCourtCalendarFilters);
  private readonly allocatedHearings = this.store.selectSignal(getAllocatedHearings);

  readonly organisationUnits = this.store.selectSignal(getOrganisationUnits);
  readonly filterOptions = computed<CourtCalendarFilters>(() => {
    const options = this._rawFilterOptions();
    return { ...options, startDate: options?.startDate || new Date().toISOString() };
  });
  readonly courtCalendarHearingsVM = this.store.selectSignal(getCourtCalendarVM);
  readonly caseNotesMap = this.store.selectSignal(getCaseNotesMap);
  readonly alertState = this.store.selectSignal(getCourtCalendarAlert);

  @ViewChild('allocatedTableSummary', { read: ElementRef<HTMLElement> })
  allocatedTableElement: ElementRef<HTMLElement>;
  errors: ValidationError[] = [];

  constructor() {
    effect(() => {
      const navAction = this.allocatedHearingActionsStore.onNavigateHearingActions();
      if (navAction) {
        untracked(() => this.onNavigate(navAction));
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(new ClearAllocatedHearingsAction());
    this.store.dispatch(CourtCalendarActions.setSelectedHearingData({ selectedHearing: null }));
  }

  onSubmitFormFilters(filterOptions: CourtCalendarFilters) {
    this.clearAlert();
    this.allocatedHearingActionsStore.resetState();
    this.store.dispatch(
      CourtCalendarActions.searchCourtCalendar({
        filterOptions: { ...filterOptions, pageSize: filterOptions.pageSize ?? 40 }
      })
    );
  }

  pageChanged(event: { pageNumber: number; pageSize?: number }): void {
    const filterOptions = this.filterOptions();
    this.onSubmitFormFilters({
      ...filterOptions,
      pageNumber: event.pageNumber,
      pageSize: event.pageSize ?? filterOptions.pageSize
    });
    if (this.allocatedTableElement?.nativeElement?.scrollIntoView) {
      this.allocatedTableElement.nativeElement.scrollIntoView({ block: 'start' });
    }
  }

  onGetCaseNotesForId(caseId: string) {
    if (this.caseNotesMap()[caseId] === undefined) {
      this.store.dispatch(CourtCalendarActions.setCaseNotesForCase({ caseId }));
    }
  }

  onUndoHearingMove() {
    this.allocatedHearingActionsStore.resetMoveState();
  }

  onHearingSequence(sequenceEvent: SequenceEvent) {
    const { courtType } = this.filterOptions();
    this.allocatedHearingActionsStore.sequenceHearings({
      ...sequenceEvent,
      courtType,
      onSequenceSuccess: () => {
        this.store.dispatch(
          CourtCalendarActions.searchCourtCalendar({ filterOptions: this.filterOptions() })
        );
      }
    });
  }

  onHearingAction({
    action,
    hearingId,
    rowIdentifier,
    hearingDate,
    rows,
    hearingDateTime
  }: Partial<HearingActionsEvent>) {
    this.clearAlert();
    this.allocatedHearingActionsStore.selectAllHearings([]);
    switch (action) {
      case 'move': {
        this.allocatedHearingActionsStore.setMoveState({
          hearingId,
          rowIdentifier,
          hearingDate,
          rows
        });
        this.allocatedHearingActionsStore.clearAllocationResult();
        break;
      }
      case 'unallocate': {
        this.selectHearing({ hearingId, hearingDateTime });
        this.bulkUnallocate();
        break;
      }
      case 'change-end-date': {
        this.openChangeEndDateModal(hearingId, rows);
        break;
      }
      default: {
        this.selectHearing({ hearingId, hearingDateTime });
        break;
      }
    }
    this.allocatedHearingActionsStore.setAction(action);
  }

  private openChangeEndDateModal(hearingId: string, rows: BaseHearingRowDataVM[]) {
    const hearingDetails = rows?.find(row => row.id === hearingId)?.details;
    if (!hearingDetails) {
      return;
    }

    const modalRef = this.modalService.open<ChangeEndDateModalData>(ChangeEndDateModalComponent, {
      data: {
        hearingTypeDescription: hearingDetails.type.description,
        hearingDayCount: hearingDetails.hearingDayCount,
        endDate: hearingDetails.endDate,
        continue: (newEndDate: string) => {
          modalRef.dispose();
          this.changeHearingEndDate(hearingDetails, newEndDate);
        },
        cancel: () => {
          modalRef.dispose();
        }
      },
      disposeOnNavigation: true,
      disposeOnBackDropClick: false
    });
  }

  private changeHearingEndDate(hearing: Hearing, newEndDate: string) {
    this.allocatedHearingActionsStore.changeHearingEndDate({
      hearing,
      newEndDate,
      onSuccess: ({ previousEndDate }) => {
        this.store.dispatch(
          CourtCalendarActions.searchCourtCalendar({ filterOptions: this.filterOptions() })
        );
        this.store.dispatch(
          setAlertMessage(COURT_CALENDAR_ALERTS.resolveEndDateChange(previousEndDate, newEndDate))
        );
      }
    });
  }

  selectHearing(selectedHearing: SelectedHearingState) {
    this.allocatedHearingActionsStore.selectHearing(selectedHearing);
    this.allocatedHearingActionsStore.resetMoveState();
    this.allocatedHearingActionsStore.clearPositionedHearings();
    this.allocatedHearingActionsStore.clearAllocationResult();
  }

  selectAllHearings(selectedHearings: SelectedHearingState[]) {
    this.allocatedHearingActionsStore.selectAllHearings(selectedHearings);
    this.allocatedHearingActionsStore.resetMoveState();
    this.allocatedHearingActionsStore.clearPositionedHearings();
    this.allocatedHearingActionsStore.clearAllocationResult();
  }

  onJurisdictionTypeChange() {
    this.store.dispatch(resetAllocatedHearings());
  }

  onNavigateChangeJudiciary(queryParams) {
    this.clearAlert();
    this.route.navigate(['court-calendar', 'edit-judiciary'], { queryParams });
  }

  onBulkAction(selectedAction: HearingBulkActions) {
    this.clearAlert();
    if (selectedAction === 'unallocate') {
      this.allocatedHearingActionsStore.clearPositionedHearings();
      this.allocatedHearingActionsStore.clearAllocationResult();
      this.bulkUnallocate();
      return;
    }
    const hearings = uniq<string>(
      (this.allocatedHearingActionsStore.selectedHearings() ?? []).map(
        (h: SelectedHearingState) => h.hearingId
      )
    );
    this.onNavigate({ action: 'reallocate', hearings });
  }

  onAddUnallocateHearing() {
    this.clearAlert();
    const filterOptions = this.filterOptions();
    const {
      courtCentre: { id }
    } = filterOptions;
    this.route.navigate([`court-calendar/allocate-hearings/${id}/unallocated`], {
      queryParams: this.buildAllocateQueryParams(filterOptions)
    });
  }

  private buildAllocateQueryParams(filterOptions: CourtCalendarFilters): Record<string, string> {
    const { courtType, businessType, courtRoomId, startDate, endDate, courtSession, hearingType } =
      filterOptions;
    return {
      startDate,
      endDate,
      jurisdiction: courtType,
      businessType,
      courtRoomId,
      courtSession,
      hearingType: hearingType?.id
    };
  }

  private clearAlert() {
    this.store.dispatch(setAlertMessage({ successAlert: undefined, failureAlert: undefined }));
  }

  private onNavigate(event: { action: HearingDropdownActions; hearings: string[] }) {
    const { hearings } = this.allocatedHearings();
    const selectedHearings = event.hearings.map(hearingId =>
      hearings.find(({ id }) => id === hearingId)
    );
    const filterOptions = this.filterOptions();
    const { courtCentre } = filterOptions;

    switch (event.action) {
      case 'edit':
        this.route.navigate([`court-calendar/change-hearing-details/${selectedHearings[0].id}`]);
        break;
      case 'change':
        this.route.navigate([`court-calendar/change-courtroom/${selectedHearings[0].id}`]);
        break;
      case 'remove':
        this.store.dispatch(setSelectedHearingData({ selectedHearing: selectedHearings[0] }));
        this.route.navigate([`court-calendar/remove-hearing/${selectedHearings[0].id}`]);
        break;
      case 'reallocate':
        this.store.dispatch(setHearingsToReallocate({ hearings: selectedHearings }));
        this.route.navigate([`court-calendar/allocate-hearings/${courtCentre.id}/reallocate`], {
          queryParams: this.buildAllocateQueryParams(filterOptions)
        });

        break;
      case 'split':
        this.route.navigate([`split/${selectedHearings[0].id}`], {
          queryParams: { referrer: 'CALENDAR' }
        });
        break;
      default:
        break;
    }
  }

  private bulkUnallocate() {
    const selectedHearings = this.allocatedHearingActionsStore.selectedHearings() ?? [];
    const { hearings } = this.allocatedHearings();
    const hearingsToUnallocate = hearings.filter(h =>
      selectedHearings.some(s => s.hearingId === h.id)
    );
    const filterOptions = this.filterOptions();

    this.allocatedHearingActionsStore.unallocate({
      hearings: hearingsToUnallocate,
      jurisdiction: filterOptions.courtType,
      ouCode: filterOptions.courtCentre.oucode,
      onSuccess: ({ processedHearings, failedAllocationIds }) => {
        if (processedHearings.length > 0) {
          this.store.dispatch(
            CourtCalendarActions.searchCourtCalendar({ filterOptions: this.filterOptions() })
          );
        }
        this.store.dispatch(
          setAlertMessage(
            COURT_CALENDAR_ALERTS.resolveUnallocate(processedHearings.length, failedAllocationIds)
          )
        );
      }
    });
    this.allocatedHearingActionsStore.selectAllHearings([]);
  }
}
