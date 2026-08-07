import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { Hearing } from '../../../../../core';
import { AllocationType, CourtCalendarState } from '../../../../model';
import {
  COURT_CALENDAR_FEATURE_KEY,
  CourtCalendarActions,
  getAllocatedWidgetCalendarVm,
  getAllocationHearingsVM
} from '../../../../state';
import { setAlertMessage } from '../../../../state/actions/court-calendar.actions';
import { COURT_CALENDAR_ALERTS } from '../../../../utils/court-calendar-alert-messages';
import { MockHearing } from '../../../../utils/mocks';
import { AllocatedHearingsWidgetComponent } from '../../../allocated-hearings/allocated-hearings-widget/allocated-hearings-widget.component';
import {
  HearingTableActionsStore,
  SelectedHearingState
} from '../../../component-store/hearing-table-actions.store';
import { HearingsAllocationTableComponent } from '../../components/hearings-allocation-table.component';
import { AllocateHearingsContainer } from '../allocate-hearings.container';

class MockHearingTableActionsStore {
  selectedHearings = signal<SelectedHearingState[]>([]);
  sectionAllocatedTo = signal(undefined);
  eligibleScheduleIds = signal<string[]>([]);
  positionedHearingsState = signal(undefined);
  failedAllocationIds = signal<string[]>([]);

  allocate = jest.fn();
  unallocate = jest.fn();
  awaitAllocationResult = jest.fn();
  selectHearing = jest.fn();
  selectAllHearings = jest.fn();
  resetState = jest.fn();
  resetMoveState = jest.fn();
  clearPositionedHearings = jest.fn();
  clearAllocationResult = jest.fn();
}

describe('AllocateHearingsContainer', () => {
  let component: AllocateHearingsContainer;
  let fixture: ComponentFixture<AllocateHearingsContainer>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;
  let mockComponentStore: MockHearingTableActionsStore;

  const courtCentre = { id: 'courtCentreId', oucode: 'B01LY', oucodeL3Code: 'CROYDON' } as any;
  const filterOptions = {
    courtType: 'CROWN',
    courtCentre,
    startDate: '2026-08-04',
    endDate: '2026-08-04'
  } as any;
  const allocateWidgetFilter = { startDate: '2026-08-04', courtCentre } as any;

  const hearingToUnallocate = MockHearing as Hearing;

  const refreshUnallocatedList = CourtCalendarActions.getUnallocatedHearings({ filterOptions });
  const refreshAllocatedWidget = CourtCalendarActions.getAllocatedHearingsForWidget({
    filterOptions: { courtType: filterOptions.courtType, ...allocateWidgetFilter }
  });

  const setCalendarState = (state: Partial<CourtCalendarState>) => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        filterOptions,
        unallocated: { hearingMap: undefined, allocateWidgetFilter },
        caseNotesMap: {},
        ...state
      },
      referenceData: { organisationUnits: [], rotaBusinessTypes: [] }
    } as any);
  };

  /** Runs the unallocate flow, then resolves it through the callback the container registered. */
  const unallocateAndResolve = (result: {
    processedHearings: unknown[];
    failedAllocationIds: string[];
  }) => {
    component.onUnallocate(hearingToUnallocate);
    dispatchSpy.mockClear();
    const { onSuccess } = mockComponentStore.unallocate.mock.calls[0][0];
    onSuccess(result);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: {} }), provideRouter([])]
    })
      .overrideComponent(AllocateHearingsContainer, {
        remove: {
          imports: [AllocatedHearingsWidgetComponent, HearingsAllocationTableComponent],
          providers: [HearingTableActionsStore]
        },
        add: {
          imports: [MockAllocatedHearingsWidgetComponent, MockHearingsAllocationTableComponent]
        }
      })
      .overrideProvider(HearingTableActionsStore, {
        useValue: new MockHearingTableActionsStore()
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    // The two view models are built by the child components this spec stubs out.
    store.overrideSelector(getAllocationHearingsVM, undefined);
    store.overrideSelector(getAllocatedWidgetCalendarVm, []);
    setCalendarState({ allocationType: AllocationType.allocate });
    dispatchSpy = jest.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(AllocateHearingsContainer);
    component = fixture.componentInstance;
    mockComponentStore = TestBed.inject(
      HearingTableActionsStore
    ) as unknown as MockHearingTableActionsStore;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the AllocateHearingsContainer component', () => {
    setCalendarState({ allocationType: AllocationType.allocate });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('onUnallocate', () => {
    it('should clear the alert and any in-flight allocation state before unallocating', () => {
      setCalendarState({ allocationType: AllocationType.allocate });

      component.onUnallocate(hearingToUnallocate);

      expect(dispatchSpy).toHaveBeenCalledWith(
        setAlertMessage({ successAlert: undefined, failureAlert: undefined })
      );
      expect(mockComponentStore.clearPositionedHearings).toHaveBeenCalled();
      expect(mockComponentStore.clearAllocationResult).toHaveBeenCalled();
      expect(mockComponentStore.unallocate).toHaveBeenCalledWith(
        expect.objectContaining({
          hearings: [hearingToUnallocate],
          jurisdiction: hearingToUnallocate.jurisdictionType,
          ouCode: courtCentre.oucode
        })
      );
    });

    describe('when adding unallocated hearings', () => {
      beforeEach(() => setCalendarState({ allocationType: AllocationType.allocate }));

      it('should refresh the unallocated hearings list and the allocated widget', () => {
        unallocateAndResolve({ processedHearings: [hearingToUnallocate], failedAllocationIds: [] });

        expect(dispatchSpy).toHaveBeenCalledWith(refreshUnallocatedList);
        expect(dispatchSpy).toHaveBeenCalledWith(refreshAllocatedWidget);
      });
    });

    describe('when reallocating hearings', () => {
      beforeEach(() =>
        setCalendarState({
          allocationType: AllocationType.reallocate,
          hearingsToReallocate: [{ id: 'pending-reallocate' } as Hearing]
        })
      );

      // SPRDT-1223: getUnallocatedHearings sets allocationType to ALLOCATE and clears
      // hearingsToReallocate, which turned the Reallocate hearings page into the Add
      // unallocated hearings page without any navigation taking place.
      it('should not refresh the unallocated hearings list', () => {
        unallocateAndResolve({ processedHearings: [hearingToUnallocate], failedAllocationIds: [] });

        expect(dispatchSpy).not.toHaveBeenCalledWith(refreshUnallocatedList);
      });

      it('should still refresh the allocated widget', () => {
        unallocateAndResolve({ processedHearings: [hearingToUnallocate], failedAllocationIds: [] });

        expect(dispatchSpy).toHaveBeenCalledWith(refreshAllocatedWidget);
      });

      it('should show the unallocate success alert', () => {
        unallocateAndResolve({ processedHearings: [hearingToUnallocate], failedAllocationIds: [] });

        expect(dispatchSpy).toHaveBeenCalledWith(
          setAlertMessage({ successAlert: COURT_CALENDAR_ALERTS.UNALLOCATE_SUCCESS })
        );
      });
    });

    it('should not refresh anything when no hearing was unallocated', () => {
      setCalendarState({ allocationType: AllocationType.allocate });

      unallocateAndResolve({
        processedHearings: [],
        failedAllocationIds: [hearingToUnallocate.id]
      });

      expect(dispatchSpy).not.toHaveBeenCalledWith(refreshUnallocatedList);
      expect(dispatchSpy).not.toHaveBeenCalledWith(refreshAllocatedWidget);
      expect(dispatchSpy).toHaveBeenCalledWith(
        setAlertMessage(COURT_CALENDAR_ALERTS.resolveUnallocate(0, [hearingToUnallocate.id]))
      );
    });
  });
});

@Component({
  selector: 'hearings-allocation-table-component',
  template: ``,
  standalone: true
})
class MockHearingsAllocationTableComponent {
  readonly sections = input<any>(undefined);
  readonly totalNumber = input<number>(undefined);
  readonly currentPage = input<number>(undefined);
  readonly allocationType = input<AllocationType>(undefined);
  readonly selectedHearings = input<SelectedHearingState[]>([]);
  readonly caseNotesMap = input<any>(undefined);

  readonly pageChange = output<{ pageNumber: number; pageSize?: number }>();
  readonly onGetCaseNote = output<string>();
  readonly onSelectHearing = output<SelectedHearingState>();
  readonly onSelectAllHearings = output<SelectedHearingState[]>();
  readonly onUpdateHearingPublicListNote = output<Hearing>();
}

@Component({
  selector: 'allocated-hearings-widget',
  template: ``,
  standalone: true
})
class MockAllocatedHearingsWidgetComponent {
  readonly jurisdictionType = input<string>(undefined);
  readonly sections = input<any>(undefined);
  readonly filterOptions = input<any>(undefined);
  readonly selectedAllocationHearings = input<SelectedHearingState[]>([]);
  readonly eligibleScheduleIds = input<string[]>([]);
  readonly sectionAllocatedToState = input<any>(undefined);
  readonly positionedHearingsState = input<any>(undefined);
  readonly failedAllocationIds = input<string[]>([]);
  readonly rotaBusinessTypes = input<any>([]);
  readonly caseNotesMap = input<any>(undefined);

  readonly onGetCaseNote = output<string>();
  readonly onAllocate = output<any>();
  readonly onUnallocate = output<Hearing>();
  readonly errors = output<any>();
  readonly onSubmit = output<any>();
}
