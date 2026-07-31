import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NoSessionSlotAvaliablePipe } from '../no-session-slot-avaliable.pipe';
import { DisplayBusinessTypeAllocatePipe } from '../display-business-type-allocate.pipe';
import {
  AllocatedWidgetCourtroomCalendarVm,
  CourtRoomBusinessTypeCalendar,
  CourtRoomSessionCalendar
} from '../../model';
import { SelectedHearingState } from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { OrganisationUnit, RotaBusinessTypeCode } from '@cpp/reference-data';
import { CPPDate } from '../../../core/util';

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
      type: 'AM' as any
    }
  });

  const createMockSession = (slot: CourtRoomSessionCalendar['slot']): CourtRoomSessionCalendar => ({
    slot,
    judiciaryCalendar: []
  });

  const createMockBusinessTypeCalendar = (
    slots: CourtRoomSessionCalendar['slot'][],
    businessType: RotaBusinessTypeCode = RotaBusinessTypeCode.crownCourt
  ): CourtRoomBusinessTypeCalendar[] => [
    {
      businessType,
      sessions: slots.map(createMockSession)
    }
  ];

  const createMockSection = (
    businessTypeCalendar: CourtRoomBusinessTypeCalendar[]
  ): AllocatedWidgetCourtroomCalendarVm => ({
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

      const result = pipe.transform([], sections, null);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return false when sections array is empty', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const result = pipe.transform(selectedHearings, [], null);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return false when both arrays are empty', () => {
      const result = pipe.transform([], [], null);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return true when no slots are available (all slots return false)', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slot1 = createMockSlot();
      const slot2 = createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00');
      const businessTypeCalendar = createMockBusinessTypeCalendar([slot1, slot2]);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, sections, null);

      expect(result).toBe(true);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(2);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot1,
        null
      );
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot2,
        null
      );
    });

    it('should return false when at least one slot is available (one slot returns true)', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slots = [
        createMockSlot(),
        createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00')
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(slots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const result = pipe.transform(selectedHearings, sections, null);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple sections with multiple business type calendars', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const slots1 = [
        createMockSlot(),
        createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00')
      ];
      const slots2 = [createMockSlot('2024-01-01T10:00:00', '2024-01-01T12:00:00')];

      const sections = [
        createMockSection(createMockBusinessTypeCalendar(slots1)),
        createMockSection(createMockBusinessTypeCalendar(slots2))
      ];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, sections, null);

      expect(result).toBe(true);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(3);
    });

    it('should handle sections with empty business type calendars', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const sections = [
        createMockSection([]),
        createMockSection(createMockBusinessTypeCalendar([createMockSlot()]))
      ];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      const result = pipe.transform(selectedHearings, sections, null);

      expect(result).toBe(true);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(1);
    });

    it('should correctly aggregate slots from multiple sections', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];

      const slot1 = createMockSlot();
      const slot2 = createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00');
      const slot3 = createMockSlot('2024-01-01T10:00:00', '2024-01-01T12:00:00');

      const sections = [
        createMockSection(createMockBusinessTypeCalendar([slot1, slot2])),
        createMockSection(createMockBusinessTypeCalendar([slot3]))
      ];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);

      pipe.transform(selectedHearings, sections, null);

      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot1,
        null
      );
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot2,
        null
      );
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledWith(
        selectedHearings,
        slot3,
        null
      );
    });

    it('should return false immediately when first slot is available', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slots = [
        createMockSlot(),
        createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00')
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(slots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValueOnce(true);

      const result = pipe.transform(selectedHearings, sections, null);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).toHaveBeenCalledTimes(1);
    });
  });

  describe('business logic validation', () => {
    it('should use every() method correctly - returns true only when all slots are unavailable', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slots = [
        createMockSlot(),
        createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00'),
        createMockSlot('2024-01-01T10:00:00', '2024-01-01T12:00:00')
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(slots);
      const sections = [createMockSection(businessTypeCalendar)];

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(false);
      const result1 = pipe.transform(selectedHearings, sections, null);
      expect(result1).toBe(true);

      jest.clearAllMocks();

      mockDisplayBusinessTypeAllocatePipe.transform
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const result2 = pipe.transform(selectedHearings, sections, null);
      expect(result2).toBe(false);

      jest.clearAllMocks();

      mockDisplayBusinessTypeAllocatePipe.transform.mockReturnValue(true);
      const result3 = pipe.transform(selectedHearings, sections, null);
      expect(result3).toBe(false);
    });
  });

  describe('slotEligibleScheduleIds undefined guard', () => {
    it('should return false when slotEligibleScheduleIds is undefined', () => {
      const selectedHearings = [createMockSelectedHearing('1', '2024-01-01T10:00:00')];
      const slots = [createMockSlot()];
      const businessTypeCalendar = createMockBusinessTypeCalendar(slots);
      const sections = [createMockSection(businessTypeCalendar)];

      const result = pipe.transform(selectedHearings, sections, undefined);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
    });

    it('should return false when slotEligibleScheduleIds is undefined even with valid hearings and sections', () => {
      const selectedHearings = [
        createMockSelectedHearing('1', '2024-01-01T10:00:00'),
        createMockSelectedHearing('2', '2024-01-01T14:00:00')
      ];
      const slots = [
        createMockSlot(),
        createMockSlot('2024-01-01T14:00:00', '2024-01-01T17:00:00')
      ];
      const businessTypeCalendar = createMockBusinessTypeCalendar(slots);
      const sections = [createMockSection(businessTypeCalendar)];

      const result = pipe.transform(selectedHearings, sections, undefined);

      expect(result).toBe(false);
      expect(mockDisplayBusinessTypeAllocatePipe.transform).not.toHaveBeenCalled();
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
        pipe.transform(selectedHearings, sections, null);
      }).toThrow();
    });

    it('should handle empty arrays without errors', () => {
      const result1 = pipe.transform([], [], null);
      const result2 = pipe.transform(
        [createMockSelectedHearing('1', '2024-01-01T10:00:00')],
        [],
        null
      );
      const result3 = pipe.transform([], [createMockSection([])], null);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });
});
