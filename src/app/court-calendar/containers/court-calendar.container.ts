import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { OrganisationUnit, getOrganisationUnits } from '@cpp/reference-data';
import {
  ModalService,
  PdkErrorSummaryComponent,
  PdkButton,
  PdkCore,
  PdkGrid,
  provideModalServices,
  ValidationError
} from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';
import { CourtCalendarFiltersComponent, CourtResultSummaryComponent } from '../components';
import {
  CourtCalendarFeature,
  CourtCalendarFilters,
  CourtCalendarVM,
  HearingAllocationPayload
} from '../model';
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
import { map, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { ClearAllocatedHearingsAction, Hearing, SequenceHearing } from '../../core';
import { CaseNote } from '../../allocate-hearing/allocate-hearing.interfaces';
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
import { BaseHearingRowDataVM } from '../model/hearing-table-renderer.vm';
import { CourtCalendarAlertComponent } from '../components/court-calendar-alert.component';
import { AllocateHearingFactory } from '../utils/allocate-hearing.factory';
import { BulkActionsComponent } from '../components/bulk-actions/bulk-actions.component';
import { uniq } from 'lodash-es';
import { SubMenuComponent } from '../../shared/components/sub-menu/sub-menu.component';
import { PageSizeSelectorComponent } from '../../shared/components/page-size-selector/page-size-selector.component';
import {
  ChangeEndDateModalComponent,
  ChangeEndDateModalData
} from '../court-calendar-hearing-tables/shared/modals/change-end-date-modal.component';

@Component({
  selector: 'court-calendar-container',
  templateUrl: './court-calendar.container.html',
  imports: [
    AsyncPipe,
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
  providers: [HearingTableActionsStore, AllocateHearingFactory, provideModalServices()]
})
export class CourtCalendarContainer implements OnDestroy {
  organisationUnits$: Observable<OrganisationUnit[]>;
  filterOptions$: Observable<CourtCalendarFilters>;
  courtCalendarHearingsVM$: Observable<CourtCalendarVM>;
  @ViewChild('allocatedTableSummary', { read: ElementRef<HTMLElement> })
  allocatedTableElement: ElementRef<HTMLElement>;
  errors: ValidationError[] = [];
  caseNotesMap$: Observable<Record<string, CaseNote[]>>;
  alert$: Observable<{ successAlert?: string; failureAlert?: string }>;
  readonly destroy$: Subject<boolean> = new Subject<boolean>();
  readonly hearingMovestate$ = this.allocatedHearingActionsStore.moveState$;
  readonly selectedHearings$ = this.allocatedHearingActionsStore.selectedHearings$;
  readonly positionedHearingsState$ = this.allocatedHearingActionsStore.positionedHearingsState$;

  constructor(
    private store: Store<CourtCalendarFeatureState>,
    private route: Router,
    private allocatedHearingActionsStore: HearingTableActionsStore,
    private allocateHearingFactory: AllocateHearingFactory,
    private modalService: ModalService
  ) {
    this.organisationUnits$ = this.store.select(getOrganisationUnits);
    this.filterOptions$ = this.store.pipe(
      select(getCourtCalendarFilters),
      map(options => ({
        ...options,
        startDate: options?.startDate || new Date().toISOString()
      }))
    );
    this.courtCalendarHearingsVM$ = this.store.pipe(select(getCourtCalendarVM));
    this.caseNotesMap$ = this.store.pipe(select(getCaseNotesMap));
    this.alert$ = this.store.pipe(select(getCourtCalendarAlert));
    this.allocatedHearingActionsStore.onNavigateHearingActions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.onNavigate(event));
    this.allocatedHearingActionsStore.onSequenceHearings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(seqencedHearings => this.onSequenceHearings(seqencedHearings));
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
    this.filterOptions$.pipe(take(1)).subscribe(filterOptions => {
      this.onSubmitFormFilters({
        ...filterOptions,
        pageNumber: event.pageNumber,
        pageSize: event.pageSize ?? filterOptions.pageSize
      });
      if (this.allocatedTableElement?.nativeElement?.scrollIntoView) {
        this.allocatedTableElement.nativeElement.scrollIntoView({ block: 'start' });
      }
    });
  }

  onGetCaseNotesForId(caseId: string) {
    this.store
      .pipe(
        select(getCaseNotesMap),
        take(1),
        tap(caseNotesMap => {
          if (caseNotesMap[caseId] === undefined) {
            this.store.dispatch(CourtCalendarActions.setCaseNotesForCase({ caseId }));
          }
        })
      )
      .subscribe();
  }

  onUndoHearingMove() {
    this.allocatedHearingActionsStore.resetMoveState();
  }

  onHearingSequence(sequenceEvent: SequenceEvent) {
    this.filterOptions$.pipe(take(1)).subscribe(({ courtType }) =>
      this.allocatedHearingActionsStore.sequenceHearings({
        ...sequenceEvent,
        courtType
      })
    );
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
    this.allocatedHearingActionsStore.setAction(action);
    this.allocatedHearingActionsStore.selectAllHearings([]);
    switch (action) {
      case 'move': {
        this.allocatedHearingActionsStore.setMoveState({
          hearingId,
          rowIdentifier,
          hearingDate,
          rows
        });
        break;
      }
      case 'unallocate': {
        this.allocatedHearingActionsStore.selectHearing({ hearingId, hearingDateTime });
        this.bulkUnallocate();
        break;
      }
      case 'change-end-date': {
        this.openChangeEndDateModal(hearingId, rows);
        break;
      }

      default: {
        this.allocatedHearingActionsStore.selectHearing({ hearingId, hearingDateTime });
        break;
      }
    }
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
          this.store.dispatch(
            CourtCalendarActions.moveHearingEndDate({ hearing: hearingDetails, newEndDate })
          );
        },
        cancel: () => {
          modalRef.dispose();
        }
      },
      disposeOnNavigation: true,
      disposeOnBackDropClick: false
    });
  }

  selectHearing(selectedHearing: SelectedHearingState) {
    this.allocatedHearingActionsStore.selectHearing(selectedHearing);
    this.allocatedHearingActionsStore.resetMoveState();
  }

  selectAllHearings(selectedHearings: SelectedHearingState[]) {
    this.allocatedHearingActionsStore.selectAllHearings(selectedHearings);
    this.allocatedHearingActionsStore.resetMoveState();
  }

  onJurisdictionTypeChange() {
    this.store.dispatch(resetAllocatedHearings());
  }

  onNavigateChangeJudiciary(queryParams) {
    this.clearAlert();
    this.route.navigate(['court-calendar', 'edit-judiciary'], {
      queryParams
    });
  }

  onBulkAction(selectedAction: HearingBulkActions) {
    this.clearAlert();
    if (selectedAction === 'unallocate') {
      this.bulkUnallocate();
      return;
    }
    this.selectedHearings$
      .pipe(
        map(selectedHearings => uniq(selectedHearings.map(({ hearingId }) => hearingId))),
        take(1)
      )
      .subscribe(hearings => this.onNavigate({ action: 'reallocate', hearings }));
  }

  onAddUnallocateHearing(filterOptions: CourtCalendarFilters) {
    this.clearAlert();
    let {
      courtCentre: { id },
      startDate,
      endDate,
      courtType,
      courtSession,
      businessType
    } = filterOptions;
    let courtName: string = courtType.toLowerCase();
    this.route.navigate([`court-calendar/allocate-hearings/${courtName}/${id}/unallocated`], {
      queryParams: { startDate, endDate, courtSession, businessType }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private clearAlert() {
    this.store.dispatch(setAlertMessage({ successAlert: undefined, failureAlert: undefined }));
  }

  private onSequenceHearings(sequencedHearings: SequenceHearing[]) {
    if (sequencedHearings?.length > 0) {
      this.store.dispatch(CourtCalendarActions.sequenceGroupHearings({ sequencedHearings }));
    }
  }

  private onNavigate(event: { action: HearingDropdownActions; hearings: string[] }) {
    this.store
      .pipe(
        select(getAllocatedHearings),
        map(({ hearings }) =>
          event.hearings.map(hearingId => hearings.find(({ id }) => id === hearingId))
        ),
        withLatestFrom(this.filterOptions$),
        take(1)
      )
      .subscribe(([selectedHearings, { courtCentre, startDate, endDate, courtType }]) => {
        const courtName = courtType.toLowerCase();
        switch (event.action) {
          case 'edit':
            this.route.navigate([
              `court-calendar/change-hearing-details/${selectedHearings[0].id}`
            ]);
            break;
          case 'change':
            this.route.navigate([`court-calendar/change-courtroom/${selectedHearings[0].id}`]);
            break;
          case 'remove':
            this.store.dispatch(setSelectedHearingData({ selectedHearing: selectedHearings[0] }));
            this.route.navigate([`court-calendar/remove-hearing/${selectedHearings[0].id}`]);
            break;
          case 'reallocate':
            this.route.navigate(
              [`court-calendar/allocate-hearings/${courtName}/${courtCentre.id}/reallocate`],
              { queryParams: { startDate, endDate } }
            );
            this.store.dispatch(setHearingsToReallocate({ hearings: selectedHearings }));
            break;
          case 'split':
            this.route.navigate([`split/${selectedHearings[0].id}`], {
              queryParams: {
                referrer: CourtCalendarFeature.calendar
              }
            });
            break;
          default:
            break;
        }
      });
  }

  private bulkUnallocate() {
    this.selectedHearings$
      .pipe(
        withLatestFrom(this.store.pipe(select(getAllocatedHearings))),
        map(([selectedHearings, { hearings }]) =>
          this.getHearingsToUnallocate(selectedHearings, hearings)
        ),
        map(hearingsToUnallocate => {
          return CourtCalendarActions.unallocateHearings({
            payload: {
              hearings: hearingsToUnallocate
            }
          });
        }),
        take(1)
      )
      .subscribe(this.store);
    this.allocatedHearingActionsStore.selectAllHearings([]);
  }

  private getHearingsToUnallocate(selectedHearings: SelectedHearingState[], hearings: Hearing[]) {
    return hearings.reduce((hearingsToUnallocate: HearingAllocationPayload[], hearing) => {
      if (selectedHearings.some(({ hearingId }) => hearingId === hearing.id)) {
        return [...hearingsToUnallocate, this.allocateHearingFactory.unallocateHearing(hearing)];
      }
      return hearingsToUnallocate;
    }, []);
  }
}
