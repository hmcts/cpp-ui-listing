import { TestBed } from '@angular/core/testing';
import { HearingTableActionsStore, SelectedHearingState } from '../hearing-table-actions.store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { BaseHearingRowDataVM } from '../../../model/hearing-table-renderer.vm';
import { ListingService, SequenceHearing } from '../../../../core';

const baseRow: BaseHearingRowDataVM = {
  rowIdentifier: '123',
  id: '1',
  isChild: false,
  hearingDate: '2024-01-15',
  sequence: 1
};
const baseMoveState = {
  rowIdentifier: '123',
  hearingId: '2',
  hearingDate: '2024-01-16',
  rows: [baseRow]
};

const mockHearingTableState = {
  selectedHearings: ['1', '2', '3'],
  moveState: baseMoveState,
  sequenceHearings: [
    {
      id: '1',
      sequenceHearingDays: [
        {
          hearingDate: '2024-01-10',
          sequence: 1
        }
      ]
    }
  ],
  onSequenceHearings: [{ id: '1', hearingDate: '2024-01-10' }]
};
describe('HearingTableActionsStore', () => {
  let store: HearingTableActionsStore;
  let actions$: Observable<any>;
  let searchCourtCalendarHearings: jest.Mock;

  beforeEach(() => {
    searchCourtCalendarHearings = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        HearingTableActionsStore,
        provideMockActions(() => actions$),
        { provide: ListingService, useValue: { searchCourtCalendarHearings } }
      ]
    });

    store = TestBed.inject(HearingTableActionsStore);
  });

  it('should set action state', () => {
    store.setAction('move');
    store.currentAction$.subscribe((action) => {
      expect(action).toBe('move');
    });
  });

  it('should reset move state', () => {
    store.resetMoveState();
    store.moveState$.subscribe((moveState) => {
      expect(moveState).toBeUndefined();
    });
    store.onSequenceHearings$.subscribe((sequencedHearings) => {
      expect(sequencedHearings).toBeFalsy();
    });
  });

  it('should set sequence hearings', () => {
    const sequencedHearings: SequenceHearing[] = mockHearingTableState.sequenceHearings;
    store.setSequenceHearings(sequencedHearings);
    store.onSequenceHearings$.subscribe((hearings) => {
      expect(hearings).toEqual(sequencedHearings);
    });
  });

  it('should set move state', () => {
    store.setMoveState(mockHearingTableState.moveState);
    store.moveState$.subscribe((state) => {
      expect(state).toEqual(mockHearingTableState.moveState);
    });
  });

  it('should set selected hearings uniquely', () => {
    store.selectHearing({ hearingId: '3' } as SelectedHearingState);
    store.selectedHearings$.subscribe((hearings) => {
      expect(hearings).toEqual([{ hearingId: '3' }]);
    });

    store.selectAllHearings([{ hearingId: '3' }, { hearingId: '4' }] as SelectedHearingState[]);
    store.selectedHearings$.subscribe((hearings) => {
      expect(hearings).toEqual([{ hearingId: '3' }, { hearingId: '4' }]);
    });
  });
});
