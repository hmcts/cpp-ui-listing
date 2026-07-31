import { IsCurrentOrGreaterThanDatePipe } from '../is-current-or-greater-date.pipe';

describe('IsCurrentOrGreaterThanDatePipe', () => {
  let pipe: IsCurrentOrGreaterThanDatePipe;

  beforeEach(() => {
    pipe = new IsCurrentOrGreaterThanDatePipe();
  });

  describe('transform', () => {
    it('should create', () => {
      expect(pipe).toBeTruthy();
    });

    it('should return true for current date', () => {
      const today = new Date();
      const result = pipe.transform(today);
      expect(result).toBe(true);
    });

    it('should return true for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = pipe.transform(futureDate);
      expect(result).toBe(true);
    });

    it('should return false for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = pipe.transform(pastDate);
      expect(result).toBe(false);
    });

    it('should handle string date input for current date', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = pipe.transform(today);
      expect(result).toBe(true);
    });

    it('should handle string date input for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateString = futureDate.toISOString().split('T')[0];
      const result = pipe.transform(futureDateString);
      expect(result).toBe(true);
    });

    it('should handle string date input for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const pastDateString = pastDate.toISOString().split('T')[0];
      const result = pipe.transform(pastDateString);
      expect(result).toBe(false);
    });

    it('should ignore time components and only compare dates', () => {
      const today = new Date();
      const todayWithDifferentTime = new Date(today);
      todayWithDifferentTime.setHours(23, 59, 59, 999);

      const result = pipe.transform(todayWithDifferentTime);
      expect(result).toBe(true);
    });

    it('should handle ISO string format', () => {
      const today = new Date();
      const todayISO = today.toISOString();
      const result = pipe.transform(todayISO);
      expect(result).toBe(true);
    });

    it('should handle different date string formats', () => {
      const today = new Date();
      const todayFormatted = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
      const result = pipe.transform(todayFormatted);
      expect(result).toBe(true);
    });

    it('should handle edge case of exactly midnight', () => {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      const result = pipe.transform(midnight);
      expect(result).toBe(true);
    });

    it('should handle Date object with specific time', () => {
      const dateWithTime = new Date();
      dateWithTime.setHours(15, 30, 45, 500);
      const result = pipe.transform(dateWithTime);
      expect(result).toBe(true);
    });

    it('should return consistent results when called multiple times with same date', () => {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 2);

      const result1 = pipe.transform(testDate);
      const result2 = pipe.transform(testDate);
      const result3 = pipe.transform(testDate.toISOString());

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(true);
    });
  });

  describe('Edge cases and boundary testing', () => {
    it('should handle year boundary dates', () => {
      const newYearDate = new Date(new Date().getFullYear() + 1, 0, 1);
      const result = pipe.transform(newYearDate);
      expect(result).toBe(true);
    });

    it('should handle month boundary dates', () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);

      const result = pipe.transform(nextMonth);
      expect(result).toBe(true);
    });
  });
});
