import { BusinessTypeTotalHearingsSummaryPipe } from '../business-type-total-hearings-summary.pipe';
import { TotalHearingAndDurationTextPipe } from '../total-hearings-and-duration-text.pipe';
import {
  CourtRoomBusinessTypeCalendar,
  CourtRoomHearingTimeCalendar,
  HearingRowVM
} from '../../model';
import { RotaBusinessTypeCode } from '@cpp/reference-data';
import { CourtSession } from '@cpp/scheduling';
import * as courtCalendarHelper from '../../utils/court-calendar-hearings-helper';

jest.mock('../total-hearings-and-duration-text.pipe');
jest.mock('../../utils/court-calendar-hearings-helper');

describe('BusinessTypeTotalHearingsSummaryPipe', () => {
  let pipe: BusinessTypeTotalHearingsSummaryPipe;
  let mockTotalHearingsAndDurationTextPipe: jest.Mocked<TotalHearingAndDurationTextPipe>;
  let mockGetAllHearingCalendars: jest.MockedFunction<
    typeof courtCalendarHelper.getAllHearingCalendars
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTotalHearingsAndDurationTextPipe = {
      transform: jest.fn()
    } as any;

    mockGetAllHearingCalendars = courtCalendarHelper.getAllHearingCalendars as jest.MockedFunction<
      typeof courtCalendarHelper.getAllHearingCalendars
    >;

    (
      TotalHearingAndDurationTextPipe as jest.MockedClass<typeof TotalHearingAndDurationTextPipe>
    ).mockImplementation(() => {
      return mockTotalHearingsAndDurationTextPipe;
    });

    pipe = new BusinessTypeTotalHearingsSummaryPipe();
  });

  const createMockHearing = (
    id: string,
    duration: number,
    isMaster: boolean = true
  ): HearingRowVM =>
    ({
      id,
      dateTime: new Date().toISOString(),
      duration,
      judiciary: [],
      hearingDate: new Date().toISOString().split('T')[0],
      hearingType: {
        id: 'hearing-type-1',
        description: 'Standard Hearing',
        code: 'STD'
      } as any,
      defendants: {
        id: 'defendant-1',
        name: 'John Doe'
      } as any,
      offences: ['Theft', 'Assault'],
      publicListNote: 'Test note',
      isMaster,
      instances: 1,
      isChild: false,
      isLastChild: false,
      details: {
        id,
        type: { id: 'type-1', description: 'Standard' },
        courtCentreId: 'court-centre-1',
        estimatedMinutes: duration,
        allocated: true,
        jurisdictionType: 'MAGISTRATES' as const,
        judiciary: [],
        hearingLanguage: 'ENGLISH' as const,
        listedCases: [],
        hearingDays: [],
        nonSittingDays: []
      } as any,
      rowIdentifier: `row-${id}`,
      sequence: 1,
      isDisabled: false,
      checkSplit: false
    }) as HearingRowVM;

  const createMockHearingTimeCalendar = (
    time: string = '09:00-10:00',
    hearings: HearingRowVM[] = []
  ): CourtRoomHearingTimeCalendar => ({
    time,
    hearings
  });

  const createMockBusinessTypeCalendar = (
    businessTypeCode: RotaBusinessTypeCode = RotaBusinessTypeCode.general,
    hearingTimeCalendar: CourtRoomHearingTimeCalendar[] = []
  ): CourtRoomBusinessTypeCalendar => ({
    businessTypeAndSlot: {
      businessTypeCode,
      courtScheduleId: 'schedule-1',
      session: {
        startTime: '09:00',
        endTime: '17:00',
        type: 'AM' as CourtSession
      }
    },
    hearingTimeCalendar
  });

  describe('transform', () => {
    it('should create pipe instance', () => {
      expect(pipe).toBeTruthy();
      expect(pipe).toBeInstanceOf(BusinessTypeTotalHearingsSummaryPipe);
    });

    it('should transform valid business type calendar with hearings', () => {
      const mockHearings = [
        createMockHearing('1', 30),
        createMockHearing('2', 45),
        createMockHearing('3', 60)
      ];

      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-11:00', [mockHearings[0], mockHearings[1]]),
        createMockHearingTimeCalendar('11:00-12:00', [mockHearings[2]])
      ];

      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.crownCourt,
        mockHearingTimeCalendars
      );
      const expectedSummary = '(3 hearings, 2 hours 15 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle business type calendar with no hearings', () => {
      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-10:00', []),
        createMockHearingTimeCalendar('10:00-11:00', [])
      ];

      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.general,
        mockHearingTimeCalendars
      );
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle null business type calendar', () => {
      const mockHearingTimeCalendars: CourtRoomHearingTimeCalendar[] = [];
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(null as any);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle undefined business type calendar', () => {
      const mockHearingTimeCalendars: CourtRoomHearingTimeCalendar[] = [];
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(undefined as any);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle falsy business type calendar', () => {
      const mockBusinessTypeCalendar = {} as CourtRoomBusinessTypeCalendar;
      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-10:00', [createMockHearing('1', 30)])
      ];
      const expectedSummary = '(1 hearing, 30 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle business type calendar with single hearing', () => {
      const mockHearing = createMockHearing('1', 45);
      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-10:00', [mockHearing])
      ];

      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.domesticViolenceTrials,
        mockHearingTimeCalendars
      );
      const expectedSummary = '(1 hearing, 45 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle business type calendar with multiple time slots', () => {
      const morningHearings = [createMockHearing('1', 30), createMockHearing('2', 30)];
      const afternoonHearings = [
        createMockHearing('3', 60),
        createMockHearing('4', 90),
        createMockHearing('5', 45)
      ];

      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-11:00', morningHearings),
        createMockHearingTimeCalendar('13:00-16:00', afternoonHearings)
      ];

      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.trial,
        mockHearingTimeCalendars
      );
      const expectedSummary = '(5 hearings, 4 hours 15 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle when getAllHearingCalendars returns empty array', () => {
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(RotaBusinessTypeCode.general);
      const mockHearingTimeCalendars: CourtRoomHearingTimeCalendar[] = [];
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should handle different business types correctly', () => {
      const testCases: Array<{
        businessType: RotaBusinessTypeCode;
        expectedCallCount: number;
      }> = [
        { businessType: RotaBusinessTypeCode.crownCourt, expectedCallCount: 1 },
        { businessType: RotaBusinessTypeCode.general, expectedCallCount: 2 },
        { businessType: RotaBusinessTypeCode.domesticViolenceTrials, expectedCallCount: 3 },
        { businessType: RotaBusinessTypeCode.trial, expectedCallCount: 4 }
      ];

      testCases.forEach(({ businessType, expectedCallCount }, index) => {
        const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(businessType);
        const mockHearingTimeCalendars = [
          createMockHearingTimeCalendar(`${9 + index}:00-${10 + index}:00`)
        ];
        const expectedSummary = `(${index} hearings, ${index * 30} minutes listed)`;

        mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
        mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

        const result = pipe.transform(mockBusinessTypeCalendar);

        expect(result).toBe(expectedSummary);
      });

      expect(mockGetAllHearingCalendars).toHaveBeenCalledTimes(testCases.length);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledTimes(
        testCases.length
      );
    });

    it('should maintain consistent pipe instance across multiple transforms', () => {
      const mockBusinessTypeCalendar1 = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.crownCourt
      );
      const mockBusinessTypeCalendar2 = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.general
      );

      const mockHearingTimeCalendars = [createMockHearingTimeCalendar('time-1')];
      const expectedSummary = '(2 hearings, 1 hour listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result1 = pipe.transform(mockBusinessTypeCalendar1);
      const result2 = pipe.transform(mockBusinessTypeCalendar2);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledTimes(2);
      expect(mockGetAllHearingCalendars).toHaveBeenNthCalledWith(1, [mockBusinessTypeCalendar1]);
      expect(mockGetAllHearingCalendars).toHaveBeenNthCalledWith(2, [mockBusinessTypeCalendar2]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledTimes(2);
      expect(result1).toBe(expectedSummary);
      expect(result2).toBe(expectedSummary);
    });

    it('should handle edge case where TotalHearingAndDurationTextPipe returns empty string', () => {
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.crownCourt
      );
      const mockHearingTimeCalendars = [createMockHearingTimeCalendar('time-1')];

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue('');

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([mockBusinessTypeCalendar]);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe('');
    });
  });
});
