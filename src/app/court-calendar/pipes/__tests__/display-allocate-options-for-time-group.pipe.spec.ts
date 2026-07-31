import { DisplayAllocateForHearingTimeGroupPipe } from '../display-allocate-options-for-time-group.pipe';
import { SelectedHearingState } from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

describe('DisplayAllocateForHearingTimeGroupPipe', () => {
  let pipe: DisplayAllocateForHearingTimeGroupPipe;

  const createMockHearingState = (
    hearingDateTime: string,
    hearingId: string = 'test-hearing-id'
  ): SelectedHearingState => ({
    hearingId,
    hearingDateTime,
    judiciary: [],
    businessTypeAndSlot: {
      businessTypeCode: 'TEST_CODE',
      courtScheduleId: 'test-schedule-id',
      session: {
        startTime: '09:00',
        endTime: '17:00'
      }
    }
  });

  beforeEach(() => {
    pipe = new DisplayAllocateForHearingTimeGroupPipe();
  });

  describe('transform', () => {
    it('should return false when selectedHearings array is empty', () => {
      const selectedHearings: SelectedHearingState[] = [];
      const groupTime = '2024-01-01T10:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(false);
    });

    it('should return true when single hearing matches group time', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T10:30:00', 'hearing-1')
      ];
      const groupTime = '2024-01-01T10:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should return false when single hearing does not match group time', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T10:30:00', 'hearing-1')
      ];
      const groupTime = '2024-01-01T11:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(false);
    });

    it('should return true when all hearings have the same time as group time', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T10:30:00', 'hearing-1'),
        createMockHearingState('2024-01-02T10:30:00', 'hearing-2'),
        createMockHearingState('2024-01-03T10:30:00', 'hearing-3')
      ];
      const groupTime = '2024-01-01T10:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should return false when not all hearings have the same time as group time', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T10:30:00', 'hearing-1'),
        createMockHearingState('2024-01-02T10:30:00', 'hearing-2'),
        createMockHearingState('2024-01-03T11:30:00', 'hearing-3')
      ];
      const groupTime = '2024-01-01T10:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(false);
    });

    it('should handle different date formats with same time correctly', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T14:15:30', 'hearing-1'),
        createMockHearingState('2024-12-31T14:15:45', 'hearing-2')
      ];
      const groupTime = '2024-06-15T14:15:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should handle ISO date strings correctly', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T09:00:00.000Z', 'hearing-1')
      ];
      const groupTime = '2024-01-01T09:00:00.000Z';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should handle midnight time correctly', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T00:00:00', 'hearing-1'),
        createMockHearingState('2024-01-02T00:00:00', 'hearing-2')
      ];
      const groupTime = '2024-01-01T00:00:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should handle 23:59 time correctly', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T23:59:00', 'hearing-1')
      ];
      const groupTime = '2024-01-01T23:59:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should handle mixed valid and edge case times', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T12:30:00', 'hearing-1'),
        createMockHearingState('2024-01-02T12:30:15', 'hearing-2'),
        createMockHearingState('2024-01-03T12:30:59', 'hearing-3')
      ];
      const groupTime = '2024-01-01T12:30:45';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(true);
    });

    it('should return false when times differ by one minute', () => {
      const selectedHearings: SelectedHearingState[] = [
        createMockHearingState('2024-01-01T10:30:00', 'hearing-1'),
        createMockHearingState('2024-01-02T10:31:00', 'hearing-2')
      ];
      const groupTime = '2024-01-01T10:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(false);
    });

    it('should handle null or undefined hearingDateTime gracefully', () => {
      const selectedHearings: SelectedHearingState[] = [
        {
          hearingId: 'hearing-1',
          hearingDateTime: null as any,
          judiciary: [],
          businessTypeAndSlot: {
            businessTypeCode: 'TEST_CODE',
            courtScheduleId: 'test-schedule-id',
            session: {
              startTime: '09:00',
              endTime: '17:00'
            }
          }
        }
      ];
      const groupTime = '2024-01-01T10:30:00';

      const result = pipe.transform(selectedHearings, groupTime);

      expect(result).toBe(false);
    });
  });
});
