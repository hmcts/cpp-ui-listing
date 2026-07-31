import { TotalHearingAndDurationTextPipe } from '../total-hearings-and-duration-text.pipe';
import { TimeDurationPipe } from '../time-duration.pipe';
import { CourtRoomHearingTimeCalendar, HearingRowVM } from '../../model';

jest.mock('../time-duration.pipe', () => ({
  TimeDurationPipe: jest.fn().mockImplementation(() => ({
    transform: jest.fn()
  }))
}));

describe('TotalHearingAndDurationTextPipe', () => {
  let pipe: TotalHearingAndDurationTextPipe;
  let mockTimeDurationPipe: jest.Mocked<TimeDurationPipe>;

  beforeEach(() => {
    pipe = new TotalHearingAndDurationTextPipe();
    mockTimeDurationPipe = (pipe as any).timeDurationPipe;
    jest.clearAllMocks();
  });

  const createMockHearing = (
    id: string,
    duration: number,
    isMaster: boolean = true
  ): HearingRowVM =>
    ({
      id,
      dateTime: '2024-01-01T09:00:00',
      duration,
      judiciary: [],
      hearingDate: '2024-01-01',
      hearingType: {
        description: 'Test Hearing',
        hasReportingRestriction: false,
        markers: []
      },
      defendants: {
        caseUrn: 'TEST001',
        caseId: '1'
      },
      offences: ['Test Offence'],
      rowIdentifier: `row-${id}`,
      sequence: 1,
      isMaster
    }) as HearingRowVM;

  const createMockHearingTimeCalendar = (
    hearings: HearingRowVM[]
  ): CourtRoomHearingTimeCalendar => ({
    time: '09:00',
    hearings
  });

  describe('transform method', () => {
    it('should return correct text for single hearing', () => {
      const hearings = [createMockHearing('1', 60)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('1 hour');

      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(60);
      expect(result).toBe('(1 hearing, 1 hour listed)');
    });

    it('should return correct text for multiple hearings', () => {
      const hearings = [createMockHearing('1', 60), createMockHearing('2', 90)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('2 hours 30 minutes');

      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(150);
      expect(result).toBe('(2 hearings, 2 hours 30 minutes listed)');
    });

    it('should only count master hearings', () => {
      const hearings = [
        createMockHearing('1', 60, true),
        createMockHearing('2', 90, false),
        createMockHearing('3', 30, true)
      ];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('1 hour 30 minutes');
      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(90);
      expect(result).toBe('(2 hearings, 1 hour 30 minutes listed)');
    });

    it('should handle multiple hearing time calendars', () => {
      const morningHearings = [createMockHearing('1', 45)];
      const afternoonHearings = [createMockHearing('2', 75)];

      const hearingTimeCalendar = [
        createMockHearingTimeCalendar(morningHearings),
        createMockHearingTimeCalendar(afternoonHearings)
      ];

      mockTimeDurationPipe.transform.mockReturnValue('2 hours');

      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(120);
      expect(result).toBe('(2 hearings, 2 hours listed)');
    });

    it('should handle empty hearing time calendar array', () => {
      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = pipe.transform([]);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(0);
      expect(result).toBe('(0 hearings, 0 minutes listed)');
    });

    it('should handle hearing time calendars with no master hearings', () => {
      const hearings = [createMockHearing('1', 60, false), createMockHearing('2', 90, false)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(0);
      expect(result).toBe('(0 hearings, 0 minutes listed)');
    });

    it('should handle hearing time calendars with empty hearings arrays', () => {
      const hearingTimeCalendar = [
        createMockHearingTimeCalendar([]),
        createMockHearingTimeCalendar([])
      ];

      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(0);
      expect(result).toBe('(0 hearings, 0 minutes listed)');
    });

    it('should display "0 minutes" when duration is empty/falsy', () => {
      const hearings = [createMockHearing('1', 60)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = pipe.transform(hearingTimeCalendar);

      expect(result).toBe('(1 hearing, 0 minutes listed)');
    });

    it('should handle hearings with zero duration', () => {
      const hearings = [createMockHearing('1', 0), createMockHearing('2', 0)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = pipe.transform(hearingTimeCalendar);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(0);
      expect(result).toBe('(2 hearings, 0 minutes listed)');
    });
  });

  describe('getHearingCountAndDuration method', () => {
    it('should calculate correct count and duration for hearings', () => {
      const hearings = [
        createMockHearing('1', 30),
        createMockHearing('2', 45),
        createMockHearing('3', 60)
      ];

      mockTimeDurationPipe.transform.mockReturnValue('2 hours 15 minutes');

      const result = (pipe as any).getHearingCountAndDuration(hearings);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(135);
      expect(result).toEqual({
        totalHearingCount: 3,
        duration: '2 hours 15 minutes'
      });
    });

    it('should handle empty hearings array', () => {
      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = (pipe as any).getHearingCountAndDuration([]);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(0);
      expect(result).toEqual({
        totalHearingCount: 0,
        duration: ''
      });
    });

    it('should handle hearings with mixed durations including zero', () => {
      const hearings = [
        createMockHearing('1', 0),
        createMockHearing('2', 30),
        createMockHearing('3', 0)
      ];

      mockTimeDurationPipe.transform.mockReturnValue('30 minutes');

      const result = (pipe as any).getHearingCountAndDuration(hearings);

      expect(mockTimeDurationPipe.transform).toHaveBeenCalledWith(30);
      expect(result).toEqual({
        totalHearingCount: 3,
        duration: '30 minutes'
      });
    });
  });

  describe('singular vs plural text formatting', () => {
    it('should use singular "hearing" for count of 1', () => {
      const hearings = [createMockHearing('1', 60)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('1 hour');

      const result = pipe.transform(hearingTimeCalendar);

      expect(result).toContain('1 hearing,');
    });

    it('should use plural "hearings" for count of 0', () => {
      mockTimeDurationPipe.transform.mockReturnValue('');

      const result = pipe.transform([]);

      expect(result).toContain('0 hearings,');
    });

    it('should use plural "hearings" for count greater than 1', () => {
      const hearings = [createMockHearing('1', 30), createMockHearing('2', 45)];
      const hearingTimeCalendar = [createMockHearingTimeCalendar(hearings)];

      mockTimeDurationPipe.transform.mockReturnValue('1 hour 15 minutes');

      const result = pipe.transform(hearingTimeCalendar);

      expect(result).toContain('2 hearings,');
    });
  });

  describe('pipe instantiation', () => {
    it('should create pipe instance', () => {
      expect(pipe).toBeTruthy();
      expect(pipe).toBeInstanceOf(TotalHearingAndDurationTextPipe);
    });

    it('should instantiate TimeDurationPipe internally', () => {
      expect((pipe as any).timeDurationPipe).toBeDefined();
    });
  });
});
