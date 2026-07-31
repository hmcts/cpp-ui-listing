import { Hearing } from '../../../core';
import {
  dateIsCurrentOrGreaterThan,
  dateIsWithinLastSevenDays,
  isEligibleForEndDateChange
} from '../court-calendar-hearings-helper';

// The helpers compare against "now", so dates are built relative to today to keep
// assertions deterministic and clock-independent.
const atLocalMidnight = (offsetDays: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date;
};

const isoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildHearing = (overrides: Partial<Hearing> = {}): Hearing =>
  ({
    jurisdictionType: 'CROWN',
    hearingDayCount: 2,
    endDate: isoDate(atLocalMidnight(-1)),
    ...overrides
  }) as Hearing;

describe('court-calendar-hearings-helper', () => {
  describe('dateIsCurrentOrGreaterThan', () => {
    it('should return true for today', () => {
      expect(dateIsCurrentOrGreaterThan(atLocalMidnight(0))).toBe(true);
    });

    it('should return true for a future date', () => {
      expect(dateIsCurrentOrGreaterThan(atLocalMidnight(1))).toBe(true);
    });

    it('should return false for a past date', () => {
      expect(dateIsCurrentOrGreaterThan(atLocalMidnight(-1))).toBe(false);
    });

    it('should accept an ISO date string', () => {
      expect(dateIsCurrentOrGreaterThan(isoDate(atLocalMidnight(1)))).toBe(true);
      expect(dateIsCurrentOrGreaterThan(isoDate(atLocalMidnight(-1)))).toBe(false);
    });
  });

  describe('dateIsWithinLastSevenDays', () => {
    it('should return true for yesterday', () => {
      expect(dateIsWithinLastSevenDays(atLocalMidnight(-1))).toBe(true);
    });

    it('should return true for exactly seven days ago (inclusive lower bound)', () => {
      expect(dateIsWithinLastSevenDays(atLocalMidnight(-7))).toBe(true);
    });

    it('should return false for eight days ago (outside the window)', () => {
      expect(dateIsWithinLastSevenDays(atLocalMidnight(-8))).toBe(false);
    });

    it('should return false for today (exclusive upper bound)', () => {
      expect(dateIsWithinLastSevenDays(atLocalMidnight(0))).toBe(false);
    });

    it('should return false for a future date', () => {
      expect(dateIsWithinLastSevenDays(atLocalMidnight(1))).toBe(false);
    });

    it('should accept an ISO date string', () => {
      expect(dateIsWithinLastSevenDays(isoDate(atLocalMidnight(-1)))).toBe(true);
      expect(dateIsWithinLastSevenDays(isoDate(atLocalMidnight(-8)))).toBe(false);
    });
  });

  describe('isEligibleForEndDateChange', () => {
    it('should return false when no hearing details are provided', () => {
      expect(isEligibleForEndDateChange(undefined)).toBe(false);
    });

    it('should return true for a multi-day CROWN hearing whose end date is within the last seven days', () => {
      expect(isEligibleForEndDateChange(buildHearing())).toBe(true);
    });

    it('should return false for a MAGISTRATES hearing', () => {
      expect(isEligibleForEndDateChange(buildHearing({ jurisdictionType: 'MAGISTRATES' }))).toBe(
        false
      );
    });

    it('should return false for a single-day hearing', () => {
      expect(isEligibleForEndDateChange(buildHearing({ hearingDayCount: 1 }))).toBe(false);
    });

    it('should return false when the end date is today', () => {
      expect(
        isEligibleForEndDateChange(buildHearing({ endDate: isoDate(atLocalMidnight(0)) }))
      ).toBe(false);
    });

    it('should return false when the end date is in the future', () => {
      expect(
        isEligibleForEndDateChange(buildHearing({ endDate: isoDate(atLocalMidnight(3)) }))
      ).toBe(false);
    });

    it('should return false when the end date is older than seven days', () => {
      expect(
        isEligibleForEndDateChange(buildHearing({ endDate: isoDate(atLocalMidnight(-8)) }))
      ).toBe(false);
    });
  });
});
