import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import {
  PdkErrorSummaryComponent,
  ModalService,
  PdkCore,
  PdkGrid,
  provideModalServices,
  ValidationError
} from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';
import {
  HearingAllocationPayload,
  AllocateWidgetFilters,
  CourtCalendarFilters,
  CourtCalendarVM,
  CourtRoomCalendarVM,
  AllocationHearingsVM,
  AllocationType,
  CourtRoomJudicialCalendar
} from '../../../model';
import {
  CourtCalendarActions,
  CourtCalendarFeatureState,
  getCaseNotesMap,
  getCourtCalendarAlert,
  getAllocateWidgetFilter,
  getAllocationHearingsVM,
  getCourtCalendarFilters,
  getCourtCalendarVM,
  getAllocationHearings,
  getAllocationType
} from '../../../state';
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { setAlertMessage } from '../../../state/actions/court-calendar.actions';
import { AllocatedCrownHearingsWidgetComponent } from '../../allocated-hearings/allocated-crown-hearings-widget/allocated-crown-hearings-widget.component';
import {
  AllocateMoveEvent,
  HearingTableActionsStore,
  SelectedHearingState,
  SequenceEvent
} from '../../component-store/hearing-table-actions.store';
import { HearingActionsEvent } from '../../renderers/cell-renderers/action-cell.component';
import { HearingsAllocationTableComponent } from '../components/hearings-allocation-table.component';
import { AllocateHearingFactory } from '../../../utils/allocate-hearing.factory';
import { ExtendedJudicialRole, Hearing } from '../../../../core';
import { OrganisationUnit } from '@cpp/reference-data';
import { CPPDate } from '../../../../core/util';
import { CourtCalendarAlertComponent } from '../../../components/court-calendar-alert.component';
import { AllocationHearingsHeadingComponent } from '../components/hearings-allocation-heading.component';
import {
  SendNotificationModalComponent,
  SendNotificationModalData
} from '../../shared/modals/send-notification-modal.component';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

interface HearingAllocationMap {
  hearingsWithSameDate: HearingAllocationPayload[];
  hearingsWithNewDate: HearingAllocationPayload[];
}

@Component({
  selector: 'allocate-crown-hearings-container',
  template: `
    <pdk-grid container>
      @if (alert$ | async; as alert) {
        <pdk-grid full>
          <court-calendar-alert-panel
            [alertEntity]="alert"
            [shouldFocus]="true"
          ></court-calendar-alert-panel>
        </pdk-grid>
      }
    </pdk-grid>
    @if (errors?.length > 0) {
      <pdk-error-summary [errors]="errors" focusOnChange pdk-margin-top="4"></pdk-error-summary>
    }
    <div pdk-grid container pdk-padding-top="6">
      <div pdk-grid full>
        <back-button [linkUrl]="'../../../../'"></back-button>
        <allocation-hearings-heading
          [allocationType]="(allocationHearingsVm$ | async)?.allocationType"
          [courtCentre]="(filterOptions$ | async)?.courtCentre"
        ></allocation-hearings-heading>
      </div>
      <section pdk-grid one-half>
        <hearings-allocation-table-component
          #allocationsHearingTable
          [sections]="(allocationHearingsVm$ | async)?.allocationHearings"
          [totalNumber]="(allocationHearingsVm$ | async)?.pagination?.totalNumber"
          [currentPage]="(allocationHearingsVm$ | async)?.pagination?.currentPage"
          [allocationType]="(allocationHearingsVm$ | async)?.allocationType"
          [selectedHearings]="selectedHearings$ | async"
          [caseNotesMap]="caseNotesMap$ | async"
          [pageSize]="pageSize"
          (pageChange)="pageChanged($event)"
          (onGetCaseNote)="onGetCaseNotesForId($event)"
          (onSelectHearing)="selectHearing($event)"
          (onSelectAllHearings)="selectAllHearings($event)"
          (onUpdateHearingPublicListNote)="updateHearingPublicListNote($event)"
        ></hearings-allocation-table-component>
      </section>
      <section pdk-grid one-half>
        <allocated-crown-hearing-widget
          [sections]="(allocatedHearingsVm$ | async)?.courtRoomCalendars"
          [filterOptions]="widgetFilters$ | async"
          [hearingMoveState]="hearingMovestate$ | async"
          [positionedHearingsState]="positionedHearingsState$ | async"
          [selectedAllocationHearings]="selectedHearings$ | async"
          [sectionAllocatedToState]="sectionAllocatedTo$ | async"
          [caseNotesMap]="caseNotesMap$ | async"
          (onGetCaseNote)="onGetCaseNotesForId($event)"
          (onSequence)="onHearingSequence($event)"
          (onAllocateAndMove)="onAllocateAndMove($event)"
          (actionClicked)="onHearingAction($event)"
          (undoHearingMoveClicked)="onUndoHearingMove()"
          (errors)="errors = $event"
          (onSubmit)="onSubmitWidgetFilters($event)"
        ></allocated-crown-hearing-widget>
      </section>
    </div>
  `,
  imports: [
    AsyncPipe,
    AllocatedCrownHearingsWidgetComponent,
    HearingsAllocationTableComponent,
    CourtCalendarAlertComponent,
    AllocationHearingsHeadingComponent,
    PdkGrid,
    PdkCore,
    BackButtonComponent,
    PdkErrorSummaryComponent
  ],
  providers: [HearingTableActionsStore, AllocateHearingFactory, provideModalServices()]
})
export class AllocateCrownHearingsContainer implements OnDestroy {
  errors: ValidationError[] = [];
  readonly allocatedHearingsVm$: Observable<CourtCalendarVM>;
  readonly allocationHearingsVm$: Observable<AllocationHearingsVM>;
  readonly caseNotesMap$: Observable<Record<string, CaseNote[]>>;
  readonly alert$: Observable<{ successAlert?: string; failureAlert?: string }>;
  readonly widgetFilters$: Observable<AllocateWidgetFilters>;
  readonly filterOptions$: Observable<CourtCalendarFilters>;
  readonly hearingMovestate$ = this.hearingTableActionStore.moveState$;
  readonly selectedHearings$ = this.hearingTableActionStore.selectedHearings$;
  readonly positionedHearingsState$ = this.hearingTableActionStore.positionedHearingsState$;
  readonly sectionAllocatedTo$ = this.hearingTableActionStore.sectionAllocatedTo$;
  readonly destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('allocationsHearingTable', { read: ElementRef<HTMLElement> })
  allocationHearingsTableElement: ElementRef<HTMLElement>;
  pageSize = 40;

  constructor(
    private store: Store<CourtCalendarFeatureState>,
    private hearingTableActionStore: HearingTableActionsStore,
    private allocateHearingFactory: AllocateHearingFactory,
    private cppDate: CPPDate,
    private modalService: ModalService
  ) {
    this.caseNotesMap$ = this.store.pipe(select(getCaseNotesMap));
    this.alert$ = this.store.pipe(select(getCourtCalendarAlert));
    this.widgetFilters$ = this.store.pipe(select(getAllocateWidgetFilter));
    this.allocatedHearingsVm$ = this.store.pipe(select(getCourtCalendarVM));
    this.allocationHearingsVm$ = this.store.pipe(select(getAllocationHearingsVM));
    this.filterOptions$ = this.store.select(getCourtCalendarFilters);
    this.hearingTableActionStore.onSequenceHearings$
      .pipe(
        filter(sequencedHearings => !!sequencedHearings),
        map(sequencedHearings => CourtCalendarActions.sequenceGroupHearings({ sequencedHearings })),
        takeUntil(this.destroy$)
      )
      .subscribe(this.store);
  }

  onSubmitWidgetFilters(options: AllocateWidgetFilters) {
    this.clearAlert();
    this.filterOptions$
      .pipe(
        map(({ courtType }) =>
          CourtCalendarActions.getAllocatedHearingsForWidget({
            filterOptions: {
              courtType,
              ...options
            }
          })
        ),
        take(1)
      )
      .subscribe(this.store);
    this.hearingTableActionStore.resetState();
  }

  pageChanged(event: { pageNumber: number; pageSize?: number }): void {
    this.filterOptions$.pipe(take(1)).subscribe(filterOptions => {
      this.clearAlert();
      this.store.dispatch(
        CourtCalendarActions.getUnallocatedHearings({
          filterOptions: {
            ...filterOptions,
            pageSize: event.pageSize,
            pageNumber: event.pageNumber
          }
        })
      );
      this.hearingTableActionStore.selectAllHearings([]);
      if (this.allocationHearingsTableElement.nativeElement.scrollIntoView) {
        this.allocationHearingsTableElement.nativeElement.scrollIntoView({ block: 'start' });
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

  selectHearing(selectedHearing: SelectedHearingState) {
    this.clearAlert();
    this.hearingTableActionStore.selectHearing(selectedHearing);
    this.hearingTableActionStore.resetMoveState();
  }

  selectAllHearings(selectedHearings: SelectedHearingState[]) {
    this.clearAlert();
    this.hearingTableActionStore.selectAllHearings(selectedHearings);
    this.hearingTableActionStore.resetMoveState();
  }

  clearAlert() {
    this.store.dispatch(setAlertMessage({ successAlert: undefined, failureAlert: undefined }));
  }

  onHearingAction({ action, hearingId, rowIdentifier, hearingDate, rows }: HearingActionsEvent) {
    this.clearAlert();
    this.hearingTableActionStore.setAction(action);
    if (action === 'move') {
      this.hearingTableActionStore.setMoveState({
        hearingId,
        rowIdentifier,
        hearingDate,
        rows
      });
    }
    if (action === 'unallocate') {
      const hearingDetails = rows?.find(row => row.id === hearingId)?.details;
      const unallocatedHearing = this.allocateHearingFactory.unallocateHearing(hearingDetails);
      this.store.dispatch(
        CourtCalendarActions.unallocateHearings({
          payload: { hearings: [unallocatedHearing] }
        })
      );
    }
  }

  onUndoHearingMove() {
    this.hearingTableActionStore.resetMoveState();
  }

  onHearingSequence(sequenceEvent: SequenceEvent) {
    this.hearingTableActionStore.sequenceHearings({
      ...sequenceEvent,
      courtType: 'CROWN'
    });
  }

  async onAllocateAndMove({
    insertBeforeId,
    insertafterId,
    section,
    group,
    judiciaryToallocate
  }: AllocateMoveEvent) {
    const { date, judiciaryCalendar, courtRoomId } = section as CourtRoomCalendarVM;
    this.selectedHearings$
      .pipe(
        take(1),
        map(selectedHearingState =>
          this.hydrateSelectedHearingStateWithJudiciaryAndNewTime(
            selectedHearingState,
            date,
            judiciaryCalendar,
            judiciaryToallocate
          )
        ),
        withLatestFrom(this.store.pipe(select(getAllocationHearings)), this.widgetFilters$),
        map(([selectedHearingState, { hearings }, { courtCentre }]) =>
          this.getHearingsToallocateMap(
            hearings,
            selectedHearingState,
            courtCentre,
            courtRoomId,
            date
          )
        ),
        withLatestFrom(this.store.pipe(select(getAllocationType))),
        switchMap(([allocationMap, allocationType]) =>
          this.mapNotificationToParties(allocationMap, allocationType)
        ),
        switchMap(hearingsToAllocate => {
          // if hearingsToAllocate is empty that means the user
          // has cancelled the action through the modal
          // We return an empty observable that immediately dispatches a complete notification without a next action
          if (hearingsToAllocate.length === 0) {
            return EMPTY;
          }
          return of(hearingsToAllocate);
        }),
        tap(() => {
          this.hearingTableActionStore.setSectionAllocatedToSuccess({
            courtRoomId,
            date
          });
        }),
        take(1)
      )
      .subscribe((hearingsToAllocate: HearingAllocationPayload[]) =>
        this.store.dispatch(
          CourtCalendarActions.bulkUpdateHearings({
            payload: {
              hearings: hearingsToAllocate,
              insertBeforeId,
              insertAfterId: insertafterId,
              group
            }
          })
        )
      );
  }

  updateHearingPublicListNote(updatedUnallocatedHearing: Hearing) {
    this.store.dispatch(
      CourtCalendarActions.updateHearingPublicListNote({ updatedUnallocatedHearing })
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.clearAlert();
    this.store.dispatch(CourtCalendarActions.clearUnallocatedWidgetFilter());
  }

  private getHearingsToallocateMap(
    hearings: Hearing[],
    selectedHearingState: SelectedHearingState[],
    courtCentre: OrganisationUnit,
    roomId: string,
    startDate: string
  ) {
    return hearings.reduce(
      (hearingAllocationMap, originalHearing) => {
        const selectedHearingDataFromState = selectedHearingState.find(
          ({ hearingId }) => hearingId === originalHearing.id
        );
        if (!!selectedHearingDataFromState) {
          const hearingAllocation = this.allocateHearingFactory.computeAllocatedHearing(
            originalHearing,
            courtCentre,
            roomId,
            startDate,
            selectedHearingDataFromState.hearingDateTime,
            selectedHearingDataFromState.judiciary
          );

          if (originalHearing.startDate !== hearingAllocation.startDate) {
            hearingAllocationMap.hearingsWithNewDate.push(hearingAllocation);
          } else {
            hearingAllocationMap.hearingsWithSameDate.push(hearingAllocation);
          }
          return hearingAllocationMap;
        }
        return hearingAllocationMap;
      },
      {
        hearingsWithSameDate: [],
        hearingsWithNewDate: []
      } as HearingAllocationMap
    );
  }

  /**
   * Update the SelectedHearingState with the required startdate and judiciary.
   * This primes the selectedHearingState with the necessary data above
   * to compute allocated hearings
   */
  private hydrateSelectedHearingStateWithJudiciaryAndNewTime(
    selectedHearingState: SelectedHearingState[],
    startDate: string,
    judiciaryCalendar: CourtRoomJudicialCalendar[] = [],
    judiciaryToAllocate?: ExtendedJudicialRole[]
  ): SelectedHearingState[] {
    return selectedHearingState.map(({ hearingId, hearingDateTime }) => {
      const dateTimeToAllocate = this.cppDate.localDate(
        `${startDate}T${this.cppDate.format(hearingDateTime, this.cppDate.HOURS_MINUTES_24H)}`
      );
      if (!!judiciaryToAllocate) {
        return {
          hearingId,
          hearingDateTime: this.cppDate.format(dateTimeToAllocate, 'YYYY-MM-DDTHH:mm'),
          judiciary: judiciaryToAllocate
        };
      }

      return {
        hearingId,
        hearingDateTime: this.cppDate.format(dateTimeToAllocate, 'YYYY-MM-DDTHH:mm'),
        judiciary:
          [...judiciaryCalendar]
            .reverse()
            .find(({ hearingTimeCalendar }) =>
              hearingTimeCalendar.some(
                ({ time }) => new Date(time).getTime() <= dateTimeToAllocate.getTime()
              )
            )?.judiciary ?? []
      };
    });
  }

  private async mapNotificationToParties(
    { hearingsWithNewDate, hearingsWithSameDate }: HearingAllocationMap,
    allocationType: AllocationType
  ) {
    if (hearingsWithNewDate.length === 0 || allocationType === AllocationType.allocate) {
      return Promise.resolve([...hearingsWithSameDate, ...hearingsWithNewDate]);
    }

    return new Promise<HearingAllocationPayload[]>(resolve => {
      const confirmationRef = this.modalService.open<SendNotificationModalData>(
        SendNotificationModalComponent,
        {
          data: {
            continue: (sendNotification: boolean) => {
              confirmationRef.dispose();
              resolve([
                ...hearingsWithSameDate,
                ...hearingsWithNewDate.map(allocation => ({
                  ...allocation,
                  sendNotificationToParties: sendNotification
                }))
              ]);
            },
            cancel: () => {
              confirmationRef.dispose();
              resolve([]);
            },
            newStartDate: hearingsWithNewDate[0].startDate
          },
          disposeOnNavigation: true,
          disposeOnBackDropClick: false
        }
      );
    });
  }
}
