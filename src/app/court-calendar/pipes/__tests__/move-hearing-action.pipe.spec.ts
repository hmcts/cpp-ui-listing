import {
  IsHearingBeingMovedPipe,
  HearingHasMovedPipe,
  IsNonMovingMemberOfHearingsGroupPipe
} from '../move-hearing-action.pipes';
import { BaseHearingRowDataVM } from '../../model/hearing-table-renderer.interfaces';
import { HearingTableActionsState } from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

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

describe('IsHearingBeingMovedPipe', () => {
  let pipe: IsHearingBeingMovedPipe;

  beforeEach(() => {
    pipe = new IsHearingBeingMovedPipe();
  });

  it('should return true if rowIdentifier matches moveState rowIdentifier', () => {
    const row: BaseHearingRowDataVM = baseRow;
    const moveState: HearingTableActionsState['moveState'] = baseMoveState;

    expect(pipe.transform(row, moveState)).toBe(true);
  });

  it('should return true if id, isChild, and hearingDate match moveState', () => {
    const row: BaseHearingRowDataVM = {
      rowIdentifier: '456',
      id: '1',
      isChild: true,
      hearingDate: '2024-01-15',
      sequence: 1
    };
    const moveState: HearingTableActionsState['moveState'] = {
      rowIdentifier: '789',
      hearingId: '1',
      hearingDate: '2024-01-15',
      rows: [row]
    };

    expect(pipe.transform(row, moveState)).toBe(true);
  });

  it('should return false if row does not match moveState', () => {
    const row: BaseHearingRowDataVM = {
      rowIdentifier: '456',
      id: '2',
      isChild: true,
      hearingDate: '2024-01-15',
      sequence: 1
    };
    const moveState: HearingTableActionsState['moveState'] = {
      rowIdentifier: '789',
      hearingId: '1',
      hearingDate: '2024-01-16',
      rows: [row]
    };

    expect(pipe.transform(row, moveState)).toBe(false);
  });
});

describe('HearingHasMovedPipe', () => {
  let pipe: HearingHasMovedPipe;

  beforeEach(() => {
    pipe = new HearingHasMovedPipe();
  });

  it('should return true if row id and hearingDate match sequenceSuccessState', () => {
    const sequenceSuccessState: HearingTableActionsState['positionedHearingsState'] = {
      positionedHearings: [
        {
          hearingId: '1',
          hearingDate: '2024-01-15'
        }
      ]
    };

    expect(pipe.transform(baseRow, sequenceSuccessState)).toBe(true);
  });

  it('should return false if row does not match sequenceSuccessState', () => {
    const sequenceSuccessState: HearingTableActionsState['positionedHearingsState'] = {
      positionedHearings: [
        {
          hearingId: '2',
          hearingDate: '2024-01-15'
        }
      ]
    };

    expect(pipe.transform(baseRow, sequenceSuccessState)).toBe(false);
  });
});

describe('IsNonMovingMemberOfHearingsGroupPipe', () => {
  let pipe: IsNonMovingMemberOfHearingsGroupPipe;

  beforeEach(() => {
    pipe = new IsNonMovingMemberOfHearingsGroupPipe();
  });

  it('should return true if hearing is master and present in moveState rows but not currently being moved', () => {
    const hearing: BaseHearingRowDataVM = {
      rowIdentifier: '123',
      isMaster: true,
      id: '1',
      isChild: false,
      hearingDate: '2024-01-15',
      sequence: 1
    };
    const moveState: HearingTableActionsState['moveState'] = {
      rowIdentifier: '456',
      hearingId: '2',
      hearingDate: '2024-01-16',
      rows: [hearing]
    };

    expect(pipe.transform(hearing, moveState)).toBe(true);
  });

  it('should return false if hearing is being moved', () => {
    const hearing: BaseHearingRowDataVM = {
      rowIdentifier: '123',
      isMaster: true,
      id: '1',
      isChild: false,
      hearingDate: '2024-01-15',
      sequence: 1
    };
    const moveState: HearingTableActionsState['moveState'] = {
      rowIdentifier: '123',
      hearingId: '1',
      hearingDate: '2024-01-15',
      rows: [hearing]
    };

    expect(pipe.transform(hearing, moveState)).toBe(false);
  });

  it('should return false if hearing is not in moveState rows', () => {
    const hearing: BaseHearingRowDataVM = {
      rowIdentifier: '789',
      isMaster: true,
      id: '3',
      isChild: false,
      hearingDate: '2024-01-15',
      sequence: 1
    };
    const moveState: HearingTableActionsState['moveState'] = {
      rowIdentifier: '1223',
      hearingId: '2',
      hearingDate: '2024-01-15',
      rows: []
    };

    expect(pipe.transform(hearing, moveState)).toBe(false);
  });
});
