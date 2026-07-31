import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import {
  ModalService,
  provideModalServices,
  ValidationError,
  PdkErrorSummaryComponent,
  PdkGrid,
  PdkCore
} from '@cpp/pdk';
import { AsyncPipe } from '@angular/common';
import {
  HearingAllocationPayload,
  AllocateWidgetFilters,
  CourtCalendarFilters,
  MagsWidgetCourtroomCalendarVm,
  AllocationHearingsVM,
  AllocationType
} from '../../../model';
import {
  CourtCalendarActions,
  CourtCalendarFeatureState,
  getCaseNotesMap,
  getCourtCalendarAlert,
  getAllocateWidgetFilter,
  getAllocationHearingsVM,
  getCourtCalendarFilters,
  getAllocationHearings,
  getAllocationType,
  getMagsWidgetCourtCalendarVm
} from '../../../state';
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { setAlertMessage } from '../../../state/actions/court-calendar.actions';
import {
  HearingTableActionsStore,
  SelectedHearingState,
  SequenceEvent
} from '../../component-store/hearing-table-actions.store';
import { HearingActionsEvent } from '../../renderers/cell-renderers/action-cell.component';
import { HearingsAllocationTableComponent } from '../components/hearings-allocation-table.component';
import { AllocateHearingFactory } from '../../../utils/allocate-hearing.factory';
import { Hearing } from '../../../../core';
import { getRotaBusinessTypes, OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import { CourtCalendarAlertComponent } from '../../../components/court-calendar-alert.component';
import { AllocationHearingsHeadingComponent } from '../components/hearings-allocation-heading.component';
import {
  SendNotificationModalComponent,
  SendNotificationModalData
} from '../../shared/modals/send-notification-modal.component';
import { AllocatedMagistratesHearingsWidgetComponent } from '../../allocated-hearings/allocated-magistrates-hearings-widget/allocated-magistrates-hearings-widget.component';
import { CourtSession } from '@cpp/scheduling';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

interface HearingAllocationMap {
  hearingsWithSameDate: HearingAllocationPayload[];
  hearingsWithNewDate: HearingAllocationPayload[];
}

@Component({
  selector: 'allocate-magistrates-hearings-container',
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
        ></hearings-allocation-table-component>
      </section>
      <section pdk-grid one-half>
        <allocated-magistrates-hearing-widget
          [sections]="allocatedHearingsVm$ | async"
          [filterOptions]="widgetFilters$ | async"
          [hearingMoveState]="hearingMovestate$ | async"
          [positionedHearingsState]="positionedHearingsState$ | async"
          [selectedAllocationHearings]="selectedHearings$ | async"
          [sectionAllocatedToState]="sectionAllocatedTo$ | async"
          [rotaBusinessTypes]="rotaBusinessTypes$ | async"
          [caseNotesMap]="caseNotesMap$ | async"
          (onGetCaseNote)="onGetCaseNotesForId($event)"
          (onSequence)="onHearingSequence($event)"
          (onAllocate)="onAllocate($event)"
          (actionClicked)="onHearingAction($event)"
          (undoHearingMoveClicked)="onUndoHearingMove()"
          (errors)="errors = $event"
          (onSubmit)="onSubmitWidgetFilters($event)"
        ></allocated-magistrates-hearing-widget>
      </section>
    </div>
  `,
  imports: [
    AsyncPipe,
    AllocatedMagistratesHearingsWidgetComponent,
    HearingsAllocationTableComponent,
    CourtCalendarAlertComponent,
    AllocationHearingsHeadingComponent,
    BackButtonComponent,
    PdkErrorSummaryComponent,
    PdkGrid,
    PdkCore
  ],
  providers: [HearingTableActionsStore, AllocateHearingFactory, provideModalServices()]
})
export class AllocateMagistratesHearingsContainer implements OnDestroy {
  errors: ValidationError[] = [];
  readonly allocatedHearingsVm$: Observable<MagsWidgetCourtroomCalendarVm[]>;
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
  rotaBusinessTypes$: Observable<RotaBusinessType[]>;
  pageSize = 40;

  constructor(
    private store: Store<CourtCalendarFeatureState>,
    private hearingTableActionStore: HearingTableActionsStore,
    private allocateHearingFactory: AllocateHearingFactory,
    private modalService: ModalService
  ) {
    this.caseNotesMap$ = this.store.pipe(select(getCaseNotesMap));
    this.alert$ = this.store.pipe(select(getCourtCalendarAlert));
    this.widgetFilters$ = this.store.pipe(select(getAllocateWidgetFilter));
    this.allocatedHearingsVm$ = this.store.pipe(select(getMagsWidgetCourtCalendarVm));
    this.allocationHearingsVm$ = this.store.pipe(select(getAllocationHearingsVM));
    this.filterOptions$ = this.store.select(getCourtCalendarFilters);
    this.rotaBusinessTypes$ = this.store.select(getRotaBusinessTypes);
    this.hearingTableActionStore.onSequenceHearings$
      .pipe(
        filter((sequencedHearings) => !!sequencedHearings),
        map((sequencedHearings) =>
          CourtCalendarActions.sequenceGroupHearings({ sequencedHearings })
        ),
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
            filterOptions: { courtType, ...options }
          })
        ),
        take(1)
      )
      .subscribe(this.store);
    this.hearingTableActionStore.resetState();
  }

  pageChanged(event: { pageNumber: number; pageSize?: number }): void {
    this.filterOptions$.pipe(take(1)).subscribe((filterOptions) => {
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
        tap((caseNotesMap) => {
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
  }

  onUndoHearingMove() {
    this.hearingTableActionStore.resetMoveState();
  }

  onHearingSequence(sequenceEvent: SequenceEvent) {
    this.hearingTableActionStore.sequenceHearings({
      ...sequenceEvent,
      courtType: 'MAGISTRATES'
    });
  }

  async onAllocate({
    section: { courtRoomId, date },
    courtScheduleId,
    session
  }: {
    section: MagsWidgetCourtroomCalendarVm;
    courtScheduleId: string;
    session: CourtSession;
  }) {
    this.selectedHearings$
      .pipe(
        take(1),
        withLatestFrom(this.store.pipe(select(getAllocationHearings)), this.widgetFilters$),
        map(([selectedHearingState, { hearings }, { courtCentre }]) =>
          this.getHearingsToallocateMap(
            hearings,
            selectedHearingState,
            courtCentre,
            courtRoomId,
            date,
            courtScheduleId,
            session
          )
        ),
        withLatestFrom(this.store.pipe(select(getAllocationType))),
        switchMap(([allocationMap, allocationType]) =>
          this.mapNotificationToParties(allocationMap, allocationType)
        ),
        switchMap((hearingsToAllocate) => {
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
              hearings: hearingsToAllocate
            }
          })
        )
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
    startDate: string,
    courtScheduleId: string,
    session: CourtSession
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
            selectedHearingDataFromState.judiciary,
            courtScheduleId,
            session
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

  private async mapNotificationToParties(
    { hearingsWithNewDate, hearingsWithSameDate }: HearingAllocationMap,
    allocationType: AllocationType
  ) {
    if (hearingsWithNewDate.length === 0 || allocationType === AllocationType.allocate) {
      return Promise.resolve([...hearingsWithSameDate, ...hearingsWithNewDate]);
    }

    return new Promise<HearingAllocationPayload[]>((resolve) => {
      const confirmationRef = this.modalService.open<SendNotificationModalData>(
        SendNotificationModalComponent,
        {
          data: {
            continue: (sendNotification: boolean) => {
              confirmationRef.dispose();
              resolve([
                ...hearingsWithSameDate,
                ...hearingsWithNewDate.map((allocation) => ({
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
