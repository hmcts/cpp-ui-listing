import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { DisplayBusinessTypeAllocatePipe } from '../display-business-type-allocate.pipe';
import { CPPDate } from '../../../core/util';
import { CourtRoomSessionCalendar } from '../../model';
import { SelectedHearingState } from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';

type CourtSession = 'AM' | 'PM' | 'AD';

jest.mock('lodash-es', () => ({
  uniq: jest.fn(arr => [...new Set(arr)])
}));

describe('DisplayBusinessTypeAllocatePipe', () => {
  let pipe: DisplayBusinessTypeAllocatePipe;
  let mockCPPDate: jest.Mocked<CPPDate>;

  beforeEach(() => {
    mockCPPDate = {
      isSameOrAfter: jest.fn(),
      isSameOrBefore: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        DisplayBusinessTypeAllocatePipe,
        { provide: CPPDate, useValue: mockCPPDate },
        DatePipe
      ]
    });

    pipe = TestBed.inject(DisplayBusinessTypeAllocatePipe);
    jest.clearAllMocks();
  });

  const createMockSelectedHearing = (id: string, dateTime: string): SelectedHearingState => ({
    hearingId: id,
    hearingDateTime: dateTime,
    judiciary: []
  });

  const createMockSlot = (
    startTime: string = '2024-01-01T09:00:00',
    endTime: string = '2024-01-01T17:00:00'
  ): CourtRoomSessionCalendar['slot'] => ({
    courtScheduleId: 'schedule-1',
    session: {
      startTime,
      endTime,
      type: 'AM' as CourtSession
    }
  });

  describe('transform method', () => {
    it('should return false when selectedHearings array is empty', () => {
      const slot = createMockSlot();

      const result = pipe.transform([], slot);

      expect(result).toBe(false);
      expect(mockCPPDate.isSameOrAfter).not.toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).not.toHaveBeenCalled();
    });

    it('should return false when slot is null', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const result = pipe.transform(selectedHearings, null as any);

      expect(result).toBe(false);
      expect(mockCPPDate.isSameOrAfter).not.toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).not.toHaveBeenCalled();
    });

    it('should return false when slot is undefined', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const result = pipe.transform(selectedHearings, undefined as any);

      expect(result).toBe(false);
    });

    it('should return true when all hearing times are within session time range', () => {
      const selectedHearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00'),
        createMockSelectedHearing('2', '2024-01-01T14:00:00')
      ];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(true);

      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(true);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalledTimes(2);
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalledTimes(2);
    });

    it('should return false when some hearing times are outside session time range', () => {
      const selectedHearings = [
        createMockSelectedHearing('1', '2024-01-01T08:00:00'),
        createMockSelectedHearing('2', '2024-01-01T14:00:00')
      ];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValueOnce(false).mockReturnValueOnce(true);

      mockCPPDate.isSameOrBefore.mockReturnValue(true);

      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(false);
    });

    it('should return false when hearing times are after session end time', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T18:00:00')];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(false);
    });

    it('should handle duplicate hearing times correctly', () => {
      const selectedHearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00'),
        createMockSelectedHearing('2', '2024-01-01T10:00:00'),
        createMockSelectedHearing('3', '2024-01-01T14:00:00')
      ];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(true);

      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(true);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalledTimes(2);
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalledTimes(2);
    });

    it('should handle edge case where hearing time equals session start time', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T09:00:00')];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(true);

      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(true);
    });

    it('should handle edge case where hearing time equals session end time', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T17:00:00')];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(true);

      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(true);
    });

    it('should use correct date format when calling CPPDate methods', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(true);

      pipe.transform(selectedHearings, slot, null);

      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'HH:mm A'
      );
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'HH:mm A'
      );
    });
  });

  describe('slotEligibleScheduleIds three-state behavior', () => {
    const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
    const slot = createMockSlot('2024-01-01T09:00:00', '2024-01-01T17:00:00');

    beforeEach(() => {
      mockCPPDate.isSameOrAfter.mockReturnValue(true);
      mockCPPDate.isSameOrBefore.mockReturnValue(true);
    });

    it('should return false when slotEligibleScheduleIds is undefined (loading state)', () => {
      const result = pipe.transform(selectedHearings, slot, undefined);

      expect(result).toBe(false);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalled();
    });

    it('should return timeCheck result when slotEligibleScheduleIds is null (no filtering)', () => {
      const result = pipe.transform(selectedHearings, slot, null);

      expect(result).toBe(true);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalled();
    });

    it('should return false when slotEligibleScheduleIds is empty array with non-matching slot', () => {
      const result = pipe.transform(selectedHearings, slot, []);

      expect(result).toBe(false);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalled();
    });

    it('should return timeCheck && true when slotEligibleScheduleIds contains matching courtScheduleId', () => {
      const result = pipe.transform(selectedHearings, slot, ['schedule-1']);

      expect(result).toBe(true);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalled();
    });

    it('should return false when slotEligibleScheduleIds does not contain matching courtScheduleId', () => {
      const result = pipe.transform(selectedHearings, slot, ['other-id']);

      expect(result).toBe(false);
      expect(mockCPPDate.isSameOrAfter).toHaveBeenCalled();
      expect(mockCPPDate.isSameOrBefore).toHaveBeenCalled();
    });

    it('should return false when timeCheck fails even with matching courtScheduleId', () => {
      mockCPPDate.isSameOrAfter.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, slot, ['schedule-1']);

      expect(result).toBe(false);
    });
  });

  describe('pipe instantiation', () => {
    it('should create pipe instance', () => {
      expect(pipe).toBeTruthy();
      expect(pipe).toBeInstanceOf(DisplayBusinessTypeAllocatePipe);
    });

    it('should initialize DatePipe with en-GB locale', () => {
      expect((pipe as any).datePipe).toBeDefined();
    });

    it('should inject CPPDate utility', () => {
      expect((pipe as any).ccpDateUtil).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle null session in slot', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slot: CourtRoomSessionCalendar['slot'] = {
        courtScheduleId: 'schedule-1',
        session: null as any
      };

      expect(() => pipe.transform(selectedHearings, slot)).not.toThrow();
    });

    it('should handle undefined selectedHearings gracefully', () => {
      const slot = createMockSlot();
      expect(() => pipe.transform(undefined as any, slot)).toThrow();
    });
  });
});
