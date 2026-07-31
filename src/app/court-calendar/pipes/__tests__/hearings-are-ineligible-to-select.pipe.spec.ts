import { HearingsAreInEligibleToSelectPipe } from '../hearings-are-ineligible-to-select.pipe';
import { HearingRowVM } from '../../model';

describe('HearingsAreInEligibleToSelectPipe', () => {
  let pipe: HearingsAreInEligibleToSelectPipe;

  const createMockHearingRow = (overrides: Partial<HearingRowVM> = {}): HearingRowVM => ({
    id: 'test-id',
    dateTime: '2025-01-01T10:00:00Z',
    duration: 60,
    judiciary: [],
    hearingDate: '2025-01-01',
    hearingType: {} as any,
    defendants: {} as any,
    offences: [],
    rowIdentifier: 'test-row-id',
    sequence: 1,
    isMaster: false,
    isDisabled: false,
    ...overrides
  });

  beforeEach(() => {
    pipe = new HearingsAreInEligibleToSelectPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return true when all hearing rows are master and disabled', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: true }),
        createMockHearingRow({ isMaster: true, isDisabled: true }),
        createMockHearingRow({ isMaster: true, isDisabled: true })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(true);
    });

    it('should return false when at least one hearing row is not master', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: true }),
        createMockHearingRow({ isMaster: false, isDisabled: true }),
        createMockHearingRow({ isMaster: true, isDisabled: true })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when at least one hearing row is not disabled', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: true }),
        createMockHearingRow({ isMaster: true, isDisabled: false }),
        createMockHearingRow({ isMaster: true, isDisabled: true })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when hearing row is neither master nor disabled', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: true }),
        createMockHearingRow({ isMaster: false, isDisabled: false })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when hearing row is master but not disabled', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: false })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when hearing row is disabled but not master', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: false, isDisabled: true })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return true when array is empty', () => {
      const hearingRows: HearingRowVM[] = [];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(true);
    });

    it('should return true when no parameter is passed', () => {
      const result = pipe.transform();

      expect(result).toBe(true);
    });

    it('should return true when undefined is passed', () => {
      const result = pipe.transform(undefined);

      expect(result).toBe(true);
    });

    it('should handle single hearing row that meets criteria', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: true })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(true);
    });

    it('should handle single hearing row that does not meet criteria', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: false, isDisabled: false })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should handle mixed scenarios with multiple rows', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: true }),
        createMockHearingRow({ isMaster: true, isDisabled: false }),
        createMockHearingRow({ isMaster: false, isDisabled: true }),
        createMockHearingRow({ isMaster: false, isDisabled: false })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when isMaster is undefined', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: undefined, isDisabled: true })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when isDisabled is undefined', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: true, isDisabled: undefined })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });

    it('should return false when both isMaster and isDisabled are undefined', () => {
      const hearingRows: HearingRowVM[] = [
        createMockHearingRow({ isMaster: undefined, isDisabled: undefined })
      ];

      const result = pipe.transform(hearingRows);

      expect(result).toBe(false);
    });
  });
});
