import { Hearing } from '../../../core';
import { HearingRowVM } from '../../model';
import * as courtCalendarHelper from '../../utils/court-calendar-hearings-helper';
import { IsEligibleForEndDateChangePipe } from '../is-eligible-for-end-date-change.pipe';

jest.mock('../../utils/court-calendar-hearings-helper', () => ({
  isEligibleForEndDateChange: jest.fn()
}));

describe('IsEligibleForEndDateChangePipe', () => {
  let pipe: IsEligibleForEndDateChangePipe;
  let mockIsEligibleForEndDateChange: jest.MockedFunction<
    typeof courtCalendarHelper.isEligibleForEndDateChange
  >;

  const details = { jurisdictionType: 'CROWN', hearingDayCount: 2 } as Hearing;
  const hearingRow = { id: 'row-1', details } as HearingRowVM;

  beforeEach(() => {
    pipe = new IsEligibleForEndDateChangePipe();
    mockIsEligibleForEndDateChange =
      courtCalendarHelper.isEligibleForEndDateChange as jest.MockedFunction<
        typeof courtCalendarHelper.isEligibleForEndDateChange
      >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should delegate to isEligibleForEndDateChange with the hearing details and return true', () => {
    mockIsEligibleForEndDateChange.mockReturnValue(true);

    expect(pipe.transform(hearingRow)).toBe(true);
    expect(mockIsEligibleForEndDateChange).toHaveBeenCalledWith(details);
  });

  it('should return false when the helper returns false', () => {
    mockIsEligibleForEndDateChange.mockReturnValue(false);

    expect(pipe.transform(hearingRow)).toBe(false);
    expect(mockIsEligibleForEndDateChange).toHaveBeenCalledWith(details);
  });

  it('should pass undefined details through to the helper', () => {
    mockIsEligibleForEndDateChange.mockReturnValue(false);

    expect(pipe.transform({ id: 'row-2' } as HearingRowVM)).toBe(false);
    expect(mockIsEligibleForEndDateChange).toHaveBeenCalledWith(undefined);
  });

  it('should return false without a hearing row', () => {
    mockIsEligibleForEndDateChange.mockReturnValue(false);

    expect(pipe.transform(undefined)).toBe(false);
    expect(mockIsEligibleForEndDateChange).toHaveBeenCalledWith(undefined);
  });
});
