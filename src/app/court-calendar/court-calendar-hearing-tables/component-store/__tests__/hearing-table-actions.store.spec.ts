import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { HearingTableActionsStore, SelectedHearingState } from '../hearing-table-actions.store';
import { AppState, ListingService } from '../../../../core';
import { SchedulingService } from '@cpp/scheduling';
import { CPPDate } from '../../../../core/util';

describe('HearingTableActionsStore', () => {
  let store: InstanceType<typeof HearingTableActionsStore>;
  let actions$: Observable<any>;
  let mockListingService: jest.Mocked<ListingService>;
  let mockSchedulingService: jest.Mocked<SchedulingService>;
  let mockCPPDate: jest.Mocked<CPPDate>;

  const createMockSelectedHearing = (
    hearingId: string,
    hearingDateTime: string,
    duration?: number
  ): SelectedHearingState => ({
    hearingId,
    hearingDateTime,
    duration,
    judiciary: []
  });

  beforeEach(() => {
    mockListingService = {
      searchCourtCalendarHearings: jest.fn(),
      sequenceHearingSync: jest.fn()
    } as any;

    mockSchedulingService = {
      searchHearingSlots: jest.fn()
    } as any;

    mockCPPDate = {
      toUtcISO: jest.fn(),
      isSameOrAfter: jest.fn(),
      isSameOrBefore: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        HearingTableActionsStore,
        provideMockActions(() => actions$),
        provideMockStore<AppState>({
          initialState: {
            courtCalendar: {
              filters: { courtType: 'CROWN' },
              allocateWidget: { startDate: '2024-01-01' }
            }
          } as any
        }),
        { provide: ListingService, useValue: mockListingService },
        { provide: SchedulingService, useValue: mockSchedulingService },
        { provide: CPPDate, useValue: mockCPPDate },
        { provide: Actions, useFactory: () => actions$ }
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(HearingTableActionsStore);
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty selected hearings', () => {
      expect(store.selectedHearings()).toEqual([]);
    });

    it('should initialize with undefined move state', () => {
      expect(store.moveState()).toBeUndefined();
    });

    it('should initialize with undefined positioned hearings state', () => {
      expect(store.positionedHearingsState()).toBeUndefined();
    });

    it('should initialize with null eligible schedule ids', () => {
      expect(store.eligibleScheduleIds()).toBeNull();
    });
  });

  describe('computed signals', () => {
    it('should compute currentAction as null when action is undefined', () => {
      expect(store.currentAction()).toBeNull();
    });

    it('should compute currentAction correctly when action is set', () => {
      store.setAction('move');
      expect(store.currentAction()).toBe('move');
    });

    it('should compute onNavigateHearingActions as null when action is move', () => {
      store.setAction('move');
      expect(store.onNavigateHearingActions()).toBeNull();
    });

    it('should compute onNavigateHearingActions as null when action is unallocate', () => {
      store.setAction('unallocate');
      expect(store.onNavigateHearingActions()).toBeNull();
    });

    it('should compute onNavigateHearingActions correctly for valid actions', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      store.selectHearing(hearing);
      store.setAction('edit');

      const result = store.onNavigateHearingActions();
      expect(result).toEqual({
        action: 'edit',
        hearings: ['1']
      });
    });

    it('should return null for onNavigateHearingActions when no hearings selected', () => {
      store.setAction('edit');
      expect(store.onNavigateHearingActions()).toBeNull();
    });
  });

  describe('hearing selection methods', () => {
    it('should add hearing when not present in selection', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');

      store.selectHearing(hearing);

      expect(store.selectedHearings()).toHaveLength(1);
      expect(store.selectedHearings()[0]).toEqual(hearing);
    });

    it('should remove hearing when already present in selection (toggle behavior)', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');

      store.selectHearing(hearing);
      expect(store.selectedHearings()).toHaveLength(1);

      store.selectHearing(hearing);
      expect(store.selectedHearings()).toHaveLength(0);
    });

    it('should toggle based on both hearingId and hearingDateTime', () => {
      const hearing1 = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const hearing2 = createMockSelectedHearing('1', '2024-01-01T14:00:00');

      store.selectHearing(hearing1);
      store.selectHearing(hearing2);

      expect(store.selectedHearings()).toHaveLength(2);
    });

    it('should replace entire selection with selectAllHearings', () => {
      const hearing1 = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const hearing2 = createMockSelectedHearing('2', '2024-01-01T14:00:00');
      const newHearings = [
        createMockSelectedHearing('3', '2024-01-01T16:00:00'),
        createMockSelectedHearing('4', '2024-01-01T17:00:00')
      ];

      store.selectHearing(hearing1);
      store.selectHearing(hearing2);
      store.selectAllHearings(newHearings);

      expect(store.selectedHearings()).toEqual(newHearings);
    });

    it('should clear selection with clearSelection', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');

      store.selectHearing(hearing);
      expect(store.selectedHearings()).toHaveLength(1);

      store.clearSelection();
      expect(store.selectedHearings()).toHaveLength(0);
    });
  });

  describe('move state methods', () => {
    it('should set move state', () => {
      const moveState = {
        rowIdentifier: 'row-1',
        hearingId: '1',
        hearingDate: '2024-01-01',
        rows: []
      };

      store.setMoveState(moveState);

      expect(store.moveState()).toEqual(moveState);
      expect(store.positionedHearingsState()).toBeUndefined();
    });

    it('should clear positioned hearings when setting move state', () => {
      const moveState = {
        rowIdentifier: 'row-1',
        hearingId: '1',
        hearingDate: '2024-01-01',
        rows: []
      };

      store.setMoveState(moveState);
      store.clearPositionedHearings();

      expect(store.positionedHearingsState()).toBeUndefined();
    });

    it('should reset move state', () => {
      const moveState = {
        rowIdentifier: 'row-1',
        hearingId: '1',
        hearingDate: '2024-01-01',
        rows: []
      };

      store.setMoveState(moveState);
      store.setAction('move');
      store.resetMoveState();

      expect(store.moveState()).toBeUndefined();
      expect(store.currentAction()).toBeNull();
    });
  });

  describe('action methods', () => {
    it('should set action', () => {
      store.setAction('move');
      expect(store.currentAction()).toBe('move');
    });

    it('should set different actions', () => {
      store.setAction('edit');
      expect(store.currentAction()).toBe('edit');

      store.setAction('unallocate');
      expect(store.currentAction()).toBe('unallocate');
    });
  });

  describe('resetState method', () => {
    it('should reset all state properties', () => {
      const hearing = createMockSelectedHearing('1', '2024-01-01T10:00:00');
      const moveState = {
        rowIdentifier: 'row-1',
        hearingId: '1',
        hearingDate: '2024-01-01',
        rows: []
      };

      store.selectHearing(hearing);
      store.setMoveState(moveState);
      store.setAction('move');

      store.resetState();

      expect(store.selectedHearings()).toEqual([]);
      expect(store.moveState()).toBeUndefined();
      expect(store.currentAction()).toBeNull();
      expect(store.positionedHearingsState()).toBeUndefined();
    });
  });

  describe('rxMethod methods existence', () => {
    it('should have sequenceHearings method', () => {
      expect(typeof store.sequenceHearings).toBe('function');
    });

    it('should have awaitAllocationResult method', () => {
      expect(typeof store.awaitAllocationResult).toBe('function');
    });

    it('should have loadEligibleSchedules method', () => {
      expect(typeof store.loadEligibleSchedules).toBe('function');
    });

    it('should have clearAllocationResult method', () => {
      expect(typeof store.clearAllocationResult).toBe('function');
    });

    it('should have handleError method', () => {
      expect(typeof store.handleError).toBe('function');
    });
  });

  describe('snapshot testing', () => {
    it('should match initial state snapshot', () => {
      const initialState = {
        selectedHearings: store.selectedHearings(),
        moveState: store.moveState(),
        currentAction: store.currentAction(),
        onNavigateHearingActions: store.onNavigateHearingActions(),
        positionedHearingsState: store.positionedHearingsState(),
        eligibleScheduleIds: store.eligibleScheduleIds()
      };

      expect(initialState).toMatchSnapshot();
    });
  });
});
