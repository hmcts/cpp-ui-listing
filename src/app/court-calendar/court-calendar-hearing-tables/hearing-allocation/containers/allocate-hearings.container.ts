import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  PdkErrorSummaryComponent,
  ModalService,
  PdkCore,
  PdkGrid,
  provideModalServices,
  ValidationError
} from '@cpp/pdk';
import {
  HearingAllocationPayload,
  AllocateWidgetFilters,
  AllocatedWidgetCourtroomCalendarVm,
  AllocationType,
  CourtCalendarFilters
} from '../../../model';
import {
  CourtCalendarActions,
  CourtCalendarFeatureState,
  getCaseNotesMap,
  getCourtCalendarAlert,
  getAllocateWidgetFilter,
  getAllocationHearingsVM,
  getCourtCalendarFilters,
  getAllocatedWidgetCalendarVm,
  getAllocationHearings,
  getAllocationType,
  getRotaBusinessTypesForCurrentJurisdiction
} from '../../../state';
import {
  setAlertMessage,
  hearingBulkOperationComplete
} from '../../../state/actions/court-calendar.actions';
import { AllocatedHearingsWidgetComponent } from '../../allocated-hearings/allocated-hearings-widget/allocated-hearings-widget.component';
import {
  HearingTableActionsStore,
  SelectedHearingState
} from '../../component-store/hearing-table-actions.store';
import { HearingsAllocationTableComponent } from '../components/hearings-allocation-table.component';
import { AllocateHearingFactory } from '../../../utils/allocate-hearing.factory';
import { Hearing } from '../../../../core';
import { OrganisationUnit } from '@cpp/reference-data';
import { CourtCalendarAlertComponent } from '../../../components/court-calendar-alert.component';
import { AllocationHearingsHeadingComponent } from '../components/hearings-allocation-heading.component';
import {
  SendNotificationModalComponent,
  SendNotificationModalData
} from '../../shared/modals/send-notification-modal.component';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';
import { CourtSession } from '@cpp/scheduling';
import { COURT_CALENDAR_ALERTS } from '../../../utils/court-calendar-alert-messages';

interface HearingAllocationMap {
  hearingsWithSameDate: HearingAllocationPayload[];
  hearingsWithNewDate: HearingAllocationPayload[];
}

@Component({
  selector: 'allocate-hearings-container',
  template: `
    @let alert = alertState();
    @let vm = allocationHearingsVm();
    @let filters = filterOptions();
    @let caseNotes = caseNotesMap();

    <pdk-grid container>
      @if (alert) {
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
        <back-button [linkUrl]="'../../../'"></back-button>
        <allocation-hearings-heading
          [allocationType]="vm?.allocationType"
          [courtCentre]="filters?.courtCentre"
        ></allocation-hearings-heading>
      </div>
      <section pdk-grid one-half>
        <hearings-allocation-table-component
          #allocationsHearingTable
          [sections]="vm?.allocationHearings"
          [totalNumber]="vm?.pagination?.totalNumber"
          [currentPage]="vm?.pagination?.currentPage"
          [allocationType]="vm?.allocationType"
          [selectedHearings]="selectedHearings()"
          [caseNotesMap]="caseNotes"
          (pageChange)="pageChanged($event)"
          (onGetCaseNote)="onGetCaseNotesForId($event)"
          (onSelectHearing)="selectHearing($event)"
          (onSelectAllHearings)="selectAllHearings($event)"
          (onUpdateHearingPublicListNote)="updateHearingPublicListNote($event)"
        ></hearings-allocation-table-component>
      </section>
      <section pdk-grid one-half>
        <allocated-hearings-widget
          [jurisdictionType]="filters?.courtType"
          [sections]="allocatedHearingsVm()"
          [filterOptions]="widgetFilters()"
          [selectedAllocationHearings]="selectedHearings()"
          [eligibleScheduleIds]="eligibleScheduleIds()"
          [sectionAllocatedToState]="sectionAllocatedTo()"
          [positionedHearingsState]="positionedHearingsState()"
          [failedAllocationIds]="failedAllocationIds()"
          [rotaBusinessTypes]="rotaBusinessTypes()"
          [caseNotesMap]="caseNotes"
          (onGetCaseNote)="onGetCaseNotesForId($event)"
          (onAllocate)="onAllocate($event)"
          (onUnallocate)="onUnallocate($event)"
          (errors)="errors = $event"
          (onSubmit)="onSubmitWidgetFilters($event)"
        ></allocated-hearings-widget>
      </section>
    </div>
  `,
  imports: [
    AllocatedHearingsWidgetComponent,
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
export class AllocateHearingsContainer implements OnDestroy {
  private readonly store = inject(Store<CourtCalendarFeatureState>);
  private readonly hearingTableActionStore = inject(HearingTableActionsStore);
  private readonly allocateHearingFactory = inject(AllocateHearingFactory);
  private readonly modalService = inject(ModalService);

  private readonly allocationHearings = this.store.selectSignal(getAllocationHearings);
  private readonly allocationType = this.store.selectSignal(getAllocationType);

  readonly allocatedHearingsVm = this.store.selectSignal(getAllocatedWidgetCalendarVm);
  readonly allocationHearingsVm = this.store.selectSignal(getAllocationHearingsVM);
  readonly caseNotesMap = this.store.selectSignal(getCaseNotesMap);
  readonly alertState = this.store.selectSignal(getCourtCalendarAlert);
  readonly widgetFilters = this.store.selectSignal(getAllocateWidgetFilter);
  readonly filterOptions = this.store.selectSignal(getCourtCalendarFilters);
  readonly rotaBusinessTypes = this.store.selectSignal(getRotaBusinessTypesForCurrentJurisdiction);
  readonly selectedHearings = this.hearingTableActionStore.selectedHearings;
  readonly sectionAllocatedTo = this.hearingTableActionStore.sectionAllocatedTo;
  readonly eligibleScheduleIds = this.hearingTableActionStore.eligibleScheduleIds;
  readonly positionedHearingsState = this.hearingTableActionStore.positionedHearingsState;
  readonly failedAllocationIds = this.hearingTableActionStore.failedAllocationIds;

  @ViewChild('allocationsHearingTable', { read: ElementRef<HTMLElement> })
  allocationHearingsTableElement: ElementRef<HTMLElement>;
  errors: ValidationError[] = [];
  pageSize = 40;

  onSubmitWidgetFilters(options: AllocateWidgetFilters) {
    this.clearAlert();
    const { courtType } = this.filterOptions();
    this.store.dispatch(
      CourtCalendarActions.getAllocatedHearingsForWidget({
        filterOptions: { courtType, ...options }
      })
    );
    this.store.dispatch(
      CourtCalendarActions.reloadWidgetSchedules({ filterOptions: options, courtType })
    );
    this.hearingTableActionStore.resetState();
  }

  pageChanged(event: { pageNumber: number; pageSize?: number }): void {
    const filterOptions = this.filterOptions();
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
  }

  onGetCaseNotesForId(caseId: string) {
    if (this.caseNotesMap()[caseId] === undefined) {
      this.store.dispatch(CourtCalendarActions.setCaseNotesForCase({ caseId }));
    }
  }

  selectHearing(selectedHearing: SelectedHearingState) {
    this.clearAlert();
    this.hearingTableActionStore.selectHearing(selectedHearing);
    this.hearingTableActionStore.resetMoveState();
    this.hearingTableActionStore.clearPositionedHearings();
    this.hearingTableActionStore.clearAllocationResult();
  }

  selectAllHearings(selectedHearings: SelectedHearingState[]) {
    this.clearAlert();
    this.hearingTableActionStore.selectAllHearings(selectedHearings);
    this.hearingTableActionStore.resetMoveState();
    this.hearingTableActionStore.clearPositionedHearings();
    this.hearingTableActionStore.clearAllocationResult();
  }

  clearAlert() {
    this.store.dispatch(setAlertMessage({ successAlert: undefined, failureAlert: undefined }));
  }

  onUnallocate(hearingDetails: Hearing) {
    this.clearAlert();
    this.hearingTableActionStore.clearPositionedHearings();
    this.hearingTableActionStore.clearAllocationResult();
    this.hearingTableActionStore.unallocate({
      hearings: [hearingDetails],
      jurisdiction: hearingDetails.jurisdictionType,
      ouCode: this.widgetFilters().courtCentre.oucode,
      onSuccess: ({ processedHearings, failedAllocationIds }) => {
        if (processedHearings.length > 0) {
          const filterOptions = this.filterOptions();
          const widgetFilters = this.widgetFilters();
          this.reloadUnallocatedHearings(filterOptions);
          this.store.dispatch(
            CourtCalendarActions.getAllocatedHearingsForWidget({
              filterOptions: { courtType: filterOptions.courtType, ...widgetFilters }
            })
          );
        }
        this.store.dispatch(
          setAlertMessage(
            COURT_CALENDAR_ALERTS.resolveUnallocate(processedHearings.length, failedAllocationIds)
          )
        );
      }
    });
  }

  async onAllocate({
    section: { courtRoomId, date },
    courtScheduleId,
    session
  }: {
    section: AllocatedWidgetCourtroomCalendarVm;
    courtScheduleId: string;
    session: CourtSession;
  }) {
    const selectedHearingState = this.hearingTableActionStore.selectedHearings();
    const { hearings } = this.allocationHearings();
    const { courtCentre } = this.widgetFilters();
    const allocationType = this.allocationType();

    const allocationMap = this.getHearingsToAllocateMap(
      hearings,
      selectedHearingState,
      courtCentre,
      courtRoomId,
      date,
      courtScheduleId,
      session
    );

    const hearingsToAllocate = await this.mapNotificationToParties(allocationMap, allocationType);

    if (hearingsToAllocate.length === 0) {
      return;
    }

    this.hearingTableActionStore.awaitAllocationResult({ courtRoomId, date });
    this.hearingTableActionStore.allocate({
      payload: { hearings: hearingsToAllocate },
      onSuccess: ({ processedHearings, failedAllocationIds }) => {
        const filterOptions = this.filterOptions();
        const widgetFilters = this.widgetFilters();
        if (this.allocationType() === AllocationType.reallocate) {
          this.store.dispatch(
            hearingBulkOperationComplete({
              payload: { hearings: processedHearings },
              failedAllocationIds
            })
          );
        }
        this.reloadUnallocatedHearings(filterOptions);
        this.store.dispatch(
          CourtCalendarActions.getAllocatedHearingsForWidget({
            filterOptions: { courtType: filterOptions.courtType, ...widgetFilters }
          })
        );
        if (
          failedAllocationIds.length === processedHearings.length &&
          processedHearings.length > 0
        ) {
          this.store.dispatch(
            setAlertMessage({ failureAlert: COURT_CALENDAR_ALERTS.ALLOCATE_TOTAL_FAILURE })
          );
        }
      }
    });
  }

  updateHearingPublicListNote(updatedUnallocatedHearing: Hearing) {
    this.store.dispatch(
      CourtCalendarActions.updateHearingPublicListNote({ updatedUnallocatedHearing })
    );
  }

  ngOnDestroy() {
    this.clearAlert();
    this.store.dispatch(CourtCalendarActions.clearUnallocatedWidgetFilter());
    this.store.dispatch(CourtCalendarActions.clearAllocationType());
  }

  private getHearingsToAllocateMap(
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
      { hearingsWithSameDate: [], hearingsWithNewDate: [] } as HearingAllocationMap
    );
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

  private reloadUnallocatedHearings(filterOptions: CourtCalendarFilters) {
    if (this.allocationType() === AllocationType.allocate) {
      this.store.dispatch(CourtCalendarActions.getUnallocatedHearings({ filterOptions }));
    }
  }
}
