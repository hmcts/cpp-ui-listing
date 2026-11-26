import { BusinessTypeTotalHearingsSummaryPipe } from '../business-type-total-hearings-summary.pipe';
import { TotalHearingAndDurationTextPipe } from '../total-hearings-and-duration-text.pipe';
import {
  CourtRoomBusinessTypeCalendar,
  CourtRoomHearingTimeCalendar,
  CourtRoomJudicialCalendar,
  CourtRoomSessionCalendar,
  HearingRowVM
} from '../../model';
import { RotaBusinessTypeCode } from '@cpp/reference-data';
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

  const mockSlot: CourtRoomSessionCalendar['slot'] = {
    courtScheduleId: 'schedule-1',
    session: { startTime: '09:00', endTime: '17:00', type: 'AM' as any }
  };

  const createMockJudiciaryCalendar = (
    hearingTimeCalendar: CourtRoomHearingTimeCalendar[] = []
  ): CourtRoomJudicialCalendar => ({
    judiciary: [],
    hearingTimeCalendar
  });

  const createMockBusinessTypeCalendar = (
    businessType: RotaBusinessTypeCode = RotaBusinessTypeCode.general,
    judiciaryCalendars: CourtRoomJudicialCalendar[] = []
  ): CourtRoomBusinessTypeCalendar => ({
    businessType,
    sessions: [{ slot: mockSlot, judiciaryCalendar: judiciaryCalendars }]
  });

  const createMockSessionCalendar = (
    judiciaryCalendars: CourtRoomJudicialCalendar[] = []
  ): CourtRoomSessionCalendar => ({
    slot: mockSlot,
    judiciaryCalendar: judiciaryCalendars
  });

  describe('transform', () => {
    it('should create pipe instance', () => {
      expect(pipe).toBeTruthy();
      expect(pipe).toBeInstanceOf(BusinessTypeTotalHearingsSummaryPipe);
    });

    it('should transform CourtRoomBusinessTypeCalendar with hearings', () => {
      const mockHearings = [
        createMockHearing('1', 30),
        createMockHearing('2', 45),
        createMockHearing('3', 60)
      ];

      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-11:00', [mockHearings[0], mockHearings[1]]),
        createMockHearingTimeCalendar('11:00-12:00', [mockHearings[2]])
      ];

      const mockJudiciaryCalendars = [createMockJudiciaryCalendar(mockHearingTimeCalendars)];
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.crownCourt,
        mockJudiciaryCalendars
      );
      const expectedSummary = '(3 hearings, 2 hours 15 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe(expectedSummary);
    });

    it('should transform CourtRoomSessionCalendar with hearings', () => {
      const mockHearings = [createMockHearing('1', 30)];
      const mockHearingTimeCalendars = [createMockHearingTimeCalendar('09:00-10:00', mockHearings)];
      const mockJudiciaryCalendars = [createMockJudiciaryCalendar(mockHearingTimeCalendars)];
      const sessionCalendar = createMockSessionCalendar(mockJudiciaryCalendars);
      const expectedSummary = '(1 hearing, 30 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(sessionCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
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

      const mockJudiciaryCalendars = [createMockJudiciaryCalendar(mockHearingTimeCalendars)];
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.general,
        mockJudiciaryCalendars
      );
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
      expect(result).toBe(expectedSummary);
    });

    it('should handle business type calendar with empty judiciary calendars', () => {
      const mockHearingTimeCalendars: CourtRoomHearingTimeCalendar[] = [];
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.general,
        []
      );
      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith([]);
      expect(result).toBe(expectedSummary);
    });

    it('should handle business type calendar with single hearing', () => {
      const mockHearing = createMockHearing('1', 45);
      const mockHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-10:00', [mockHearing])
      ];

      const mockJudiciaryCalendars = [createMockJudiciaryCalendar(mockHearingTimeCalendars)];
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.domesticViolenceTrials,
        mockJudiciaryCalendars
      );
      const expectedSummary = '(1 hearing, 45 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
      expect(result).toBe(expectedSummary);
    });

    it('should handle business type calendar with multiple time slots across judiciary calendars', () => {
      const morningHearings = [createMockHearing('1', 30), createMockHearing('2', 30)];
      const afternoonHearings = [
        createMockHearing('3', 60),
        createMockHearing('4', 90),
        createMockHearing('5', 45)
      ];

      const mockJudiciaryCalendars = [
        createMockJudiciaryCalendar([
          createMockHearingTimeCalendar('09:00-11:00', morningHearings)
        ]),
        createMockJudiciaryCalendar([
          createMockHearingTimeCalendar('13:00-16:00', afternoonHearings)
        ])
      ];

      const combinedHearingTimeCalendars = [
        createMockHearingTimeCalendar('09:00-11:00', morningHearings),
        createMockHearingTimeCalendar('13:00-16:00', afternoonHearings)
      ];

      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.trial,
        mockJudiciaryCalendars
      );
      const expectedSummary = '(5 hearings, 4 hours 15 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue(combinedHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
      expect(result).toBe(expectedSummary);
    });

    it('should handle when getAllHearingCalendars returns empty array', () => {
      const mockJudiciaryCalendars = [createMockJudiciaryCalendar()];
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.general,
        mockJudiciaryCalendars
      );
      const expectedSummary = '(0 hearings, 0 minutes listed)';

      mockGetAllHearingCalendars.mockReturnValue([]);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
      expect(result).toBe(expectedSummary);
    });

    it('should handle different business types correctly', () => {
      const testCases: RotaBusinessTypeCode[] = [
        RotaBusinessTypeCode.crownCourt,
        RotaBusinessTypeCode.general,
        RotaBusinessTypeCode.domesticViolenceTrials,
        RotaBusinessTypeCode.trial
      ];

      testCases.forEach((businessType, index) => {
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
      const mockJudiciaryCalendars1 = [createMockJudiciaryCalendar()];
      const mockJudiciaryCalendars2 = [createMockJudiciaryCalendar()];
      const mockBusinessTypeCalendar1 = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.crownCourt,
        mockJudiciaryCalendars1
      );
      const mockBusinessTypeCalendar2 = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.general,
        mockJudiciaryCalendars2
      );

      const mockHearingTimeCalendars = [createMockHearingTimeCalendar('time-1')];
      const expectedSummary = '(2 hearings, 1 hour listed)';

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue(expectedSummary);

      const result1 = pipe.transform(mockBusinessTypeCalendar1);
      const result2 = pipe.transform(mockBusinessTypeCalendar2);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledTimes(2);
      expect(mockGetAllHearingCalendars).toHaveBeenNthCalledWith(1, mockJudiciaryCalendars1);
      expect(mockGetAllHearingCalendars).toHaveBeenNthCalledWith(2, mockJudiciaryCalendars2);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledTimes(2);
      expect(result1).toBe(expectedSummary);
      expect(result2).toBe(expectedSummary);
    });

    it('should handle edge case where TotalHearingAndDurationTextPipe returns empty string', () => {
      const mockJudiciaryCalendars = [createMockJudiciaryCalendar()];
      const mockBusinessTypeCalendar = createMockBusinessTypeCalendar(
        RotaBusinessTypeCode.crownCourt,
        mockJudiciaryCalendars
      );
      const mockHearingTimeCalendars = [createMockHearingTimeCalendar('time-1')];

      mockGetAllHearingCalendars.mockReturnValue(mockHearingTimeCalendars);
      mockTotalHearingsAndDurationTextPipe.transform.mockReturnValue('');

      const result = pipe.transform(mockBusinessTypeCalendar);

      expect(mockGetAllHearingCalendars).toHaveBeenCalledWith(mockJudiciaryCalendars);
      expect(mockTotalHearingsAndDurationTextPipe.transform).toHaveBeenCalledWith(
        mockHearingTimeCalendars
      );
      expect(result).toBe('');
    });
  });
});
