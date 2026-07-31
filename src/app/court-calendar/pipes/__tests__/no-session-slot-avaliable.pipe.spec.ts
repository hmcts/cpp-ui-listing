import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NoSessionSlotAvaliablePipe } from '../no-session-slot-avaliable.pipe';
import { DisplayBusinessTypeAllocatePipe } from '../display-business-type-allocate.pipe';
import { CourtRoomBusinessTypeCalendar, MagsWidgetCourtroomCalendarVm } from '../../model';
import { SelectedHearingState } from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { OrganisationUnit, RotaBusinessTypeCode } from '@cpp/reference-data';
import { CPPDate } from '../../../core/util';

export type CourtSession = 'AM' | 'PM' | 'AD';

jest.mock('../display-business-type-allocate.pipe', () => ({
  DisplayBusinessTypeAllocatePipe: jest.fn().mockImplementation(() => ({
    transform: jest.fn()
  }))
}));

describe('NoSessionSlotAvaliablePipe', () => {
  let pipe: NoSessionSlotAvaliablePipe;
  let mockDisplayBusinessTypeAllocatePipe: jest.Mocked<DisplayBusinessTypeAllocatePipe>;
  let mockCPPDate: jest.Mocked<CPPDate>;

  beforeEach(() => {
    mockCPPDate = {
      isSameOrAfter: jest.fn(),
      isSameOrBefore: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [NoSessionSlotAvaliablePipe, { provide: CPPDate, useValue: mockCPPDate }, DatePipe]
    });

    pipe = TestBed.inject(NoSessionSlotAvaliablePipe);
    mockDisplayBusinessTypeAllocatePipe = (pipe as any).displayBusinessTypeAllocatePipe;
    jest.clearAllMocks();
  });

  const createMockSelectedHearing = (id: string, dateTime: string): SelectedHearingState => ({
    hearingId: id,
    hearingDateTime: dateTime,
    judiciary: [],
    businessTypeAndSlot: {
      businessTypeCode: 'CC',
      courtScheduleId: 'schedule-1',
      session: { startTime: '09:00', endTime: '17:00' }
    }
  });

  const createMockBusinessTypeAndSlot = (
    businessTypeCode: RotaBusinessTypeCode = RotaBusinessTypeCode.crownCourt,
    startTime: string = '2024-01-01T09:00:00',
    endTime: string = '2024-01-01T17:00:00'
  ): CourtRoomBusinessTypeCalendar['businessTypeAndSlot'] => ({
    businessTypeCode,
    courtScheduleId: 'schedule-1',
    session: {
      startTime,
      endTime,
      type: 'AM' as CourtSession
    }
  });

  const createMockBusinessTypeCalendar = (
    businessTypeAndSlots: CourtRoomBusinessTypeCalendar['businessTypeAndSlot'][]
  ): CourtRoomBusinessTypeCalendar[] => {
    return businessTypeAndSlots.map((slot) => ({
      businessTypeAndSlot: slot,
      hearingTimeCalendar: []
    }));
  };

  const createMockSection = (
    businessTypeCalendar: CourtRoomBusinessTypeCalendar[]
  ): MagsWidgetCourtroomCalendarVm => ({
    businessTypeCalendar,
    date: '2024-01-01',
    courtRoomName: 'Court Room 1',
    courtRoomId: 'court-1',
    sectionIdentifier: 'section-1',
    courtCentre: { id: 'court-centre-id' } as OrganisationUnit
  });

  describe('transform method', () => {
    it('should return false when selectedHearings array is empty', () => {
      const sections = [createMockSection([])];

      const result = pipe.transform([], sections);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return false when sections array is empty', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const result = pipe.transform(selectedHearings, []);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return false when both arrays are empty', () => {
      const result = pipe.transform([], []);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return true when no slots are available (all slots return false)', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const businessTypeAndSlots = [
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt),
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.applications)
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(businessTypeAndSlots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, sections);

      expect(result).toBe(true);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(2);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        businessTypeAndSlots[0]
      );
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        businessTypeAndSlots[1]
      );
    });

    it('should return false when at least one slot is available (one slot returns true)', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const businessTypeAndSlots = [
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt),
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.applications)
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(businessTypeAndSlots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const result = pipe.transform(selectedHearings, sections);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple sections with multiple business type calendars', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const businessTypeAndSlots1 = [
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt),
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.applications)
      ];
      const businessTypeCalendar1 = createMockBusinessTypeCalendar(businessTypeAndSlots1);

      const businessTypeAndSlots2 = [createMockBusinessTypeAndSlot(RotaBusinessTypeCode.trial)];
      const businessTypeCalendar2 = createMockBusinessTypeCalendar(businessTypeAndSlots2);

      const sections = [
        createMockSection(businessTypeCalendar1),
        createMockSection(businessTypeCalendar2)
      ];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, sections);

      expect(result).toBe(true);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(3);
    });

    it('should handle sections with empty business type calendars', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const sections = [
        createMockSection([]),
        createMockSection(
          createMockBusinessTypeCalendar([
            createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt)
          ])
        )
      ];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, sections);

      expect(result).toBe(true);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(1);
    });

    it('should correctly aggregate business slots from multiple sections', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const slot1 = createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt);
      const slot2 = createMockBusinessTypeAndSlot(RotaBusinessTypeCode.applications);
      const slot3 = createMockBusinessTypeAndSlot(RotaBusinessTypeCode.trial);

      const sections = [
        createMockSection(createMockBusinessTypeCalendar([slot1, slot2])),
        createMockSection(createMockBusinessTypeCalendar([slot3]))
      ];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      pipe.transform(selectedHearings, sections);

      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot1
      );
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot2
      );
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot3
      );
    });

    it('should return false immediately when first slot is available', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const businessTypeAndSlots = [
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt),
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.applications)
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(businessTypeAndSlots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValueOnce(true);

      const result = pipe.transform(selectedHearings, sections);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(1);
    });
  });

  describe('business logic validation', () => {
    it('should use every() method correctly - returns true only when all slots are unavailable', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const businessTypeAndSlots = [
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.crownCourt),
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.applications),
        createMockBusinessTypeAndSlot(RotaBusinessTypeCode.trial)
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(businessTypeAndSlots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);
      const result1 = pipe.transform(selectedHearings, sections);
      expect(result1).toBe(true);

      jest.clearAllMocks();

      mockDisplayBusinessTypeAllocatePipe.transform
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const result2 = pipe.transform(selectedHearings, sections);
      expect(result2).toBe(false);

      jest.clearAllMocks();

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(true);
      const result3 = pipe.transform(selectedHearings, sections);
      expect(result3).toBe(false);
    });
  });

  describe('pipe instantiation', () => {
    it('should create pipe instance', () => {
      expect(pipe).toBeTruthy();
      expect(pipe).toBeInstanceOf(NoSessionSlotAvaliablePipe);
    });

    it('should instantiate DisplayBusinessTypeAllocatePipe internally', () => {
      expect((pipe as any).displayBusinessTypeAllocatePipe).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should throw error for null selectedHearings', () => {
      const sections = [createMockSection([])];

      expect(() => {
        pipe.transform(null as any, sections);
      }).toThrow();
    });

    it('should throw error for null sections', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      expect(() => {
        pipe.transform(selectedHearings, null as any);
      }).toThrow();
    });

    it('should throw error for undefined businessTypeCalendar', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const sections = [
        {
          businessTypeCalendar: undefined,
          date: '2024-01-01',
          courtRoomName: 'Court Room 1',
          courtRoomId: 'court-1',
          sectionIdentifier: 'section-1'
        }
      ] as any;

      expect(() => {
        pipe.transform(selectedHearings, sections);
      }).toThrow();
    });

    it('should handle empty arrays without errors', () => {
      const result1 = pipe.transform([], []);
      const result2 = pipe.transform([createMockSelectedHearing('1', '2024-01-01T10:00:00')], []);
      const result3 = pipe.transform([], [createMockSection([])]);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });
});
