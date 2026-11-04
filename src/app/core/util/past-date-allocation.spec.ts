import { ListedCase } from '../model/hearing';
import {
  checkAmendedPastDate,
  checkPastDate,
  ENFORCEMENT_AUTHORITY_CODE,
  ENFORCEMENT_BUSINESS_TYPE_CODE,
  getEarliestEnforcementDate,
  isEnforcementHearing,
  PastDateCheck
} from './past-date-allocation';

const listedCase = (authorityCode: string) => ({ caseIdentifier: { authorityCode } }) as ListedCase;

describe('past-date-allocation', () => {
  describe('isEnforcementHearing', () => {
    it('is true when every listed case belongs to the Enforcement authority', () => {
      expect(
        isEnforcementHearing({
          listedCases: [
            listedCase(ENFORCEMENT_AUTHORITY_CODE),
            listedCase(ENFORCEMENT_AUTHORITY_CODE)
          ]
        })
      ).toBe(true);
    });

    it('is false when any listed case belongs to another authority', () => {
      expect(
        isEnforcementHearing({
          listedCases: [listedCase(ENFORCEMENT_AUTHORITY_CODE), listedCase('CITYPF')]
        })
      ).toBe(false);
    });

    it('is false for hearings without listed cases, such as standalone applications', () => {
      expect(isEnforcementHearing({ listedCases: [] })).toBe(false);
      expect(isEnforcementHearing({ listedCases: undefined })).toBe(false);
      expect(isEnforcementHearing(undefined)).toBe(false);
    });
  });

  describe('getEarliestEnforcementDate', () => {
    it('is 31 days before today', () => {
      expect(getEarliestEnforcementDate('2026-10-23')).toBe('2026-09-22');
    });
  });

  describe('checkPastDate', () => {
    const today = '2026-10-23';
    const enforcement = {
      isEnforcementCase: true,
      businessType: ENFORCEMENT_BUSINESS_TYPE_CODE,
      today
    };

    it.each`
      isEnforcementCase | businessType                      | startDate       | expected
      ${true}           | ${ENFORCEMENT_BUSINESS_TYPE_CODE} | ${'2026-10-23'} | ${PastDateCheck.Allowed}
      ${true}           | ${ENFORCEMENT_BUSINESS_TYPE_CODE} | ${'2026-11-01'} | ${PastDateCheck.Allowed}
      ${true}           | ${ENFORCEMENT_BUSINESS_TYPE_CODE} | ${'2026-10-22'} | ${PastDateCheck.Warning}
      ${true}           | ${ENFORCEMENT_BUSINESS_TYPE_CODE} | ${'2026-09-22'} | ${PastDateCheck.Warning}
      ${true}           | ${ENFORCEMENT_BUSINESS_TYPE_CODE} | ${'2026-09-21'} | ${PastDateCheck.TooFarInPast}
      ${true}           | ${'GEN'}                          | ${'2026-10-22'} | ${PastDateCheck.NotEnforcementBusinessType}
      ${true}           | ${undefined}                      | ${'2026-10-22'} | ${PastDateCheck.NotEnforcementBusinessType}
      ${true}           | ${'GEN'}                          | ${'2026-10-23'} | ${PastDateCheck.Allowed}
      ${false}          | ${ENFORCEMENT_BUSINESS_TYPE_CODE} | ${'2026-10-22'} | ${PastDateCheck.NotEnforcementCase}
      ${false}          | ${'GEN'}                          | ${'2026-10-22'} | ${PastDateCheck.NotEnforcementCase}
      ${false}          | ${'GEN'}                          | ${'2026-10-23'} | ${PastDateCheck.Allowed}
    `(
      'returns $expected for enforcement case=$isEnforcementCase, business type=$businessType, start date=$startDate',
      ({ isEnforcementCase, businessType, startDate, expected }) => {
        expect(checkPastDate({ isEnforcementCase, businessType, startDate, today })).toBe(expected);
      }
    );

    it('compares calendar days, ignoring the time of day', () => {
      expect(checkPastDate({ ...enforcement, startDate: '2026-10-23T23:59:00' })).toBe(
        PastDateCheck.Allowed
      );
    });
  });

  describe('checkAmendedPastDate', () => {
    const today = '2026-10-23';

    it.each`
      isEnforcementCase | originalStartDate | startDate       | expected
      ${true}           | ${'2026-10-10'}   | ${'2026-10-10'} | ${PastDateCheck.Allowed}
      ${false}          | ${'2026-10-10'}   | ${'2026-10-10'} | ${PastDateCheck.Allowed}
      ${true}           | ${'2026-10-10'}   | ${'2026-10-01'} | ${PastDateCheck.Warning}
      ${true}           | ${'2026-10-10'}   | ${'2026-09-21'} | ${PastDateCheck.TooFarInPast}
      ${true}           | ${'2026-10-10'}   | ${'2026-10-30'} | ${PastDateCheck.Allowed}
      ${true}           | ${undefined}      | ${'2026-10-01'} | ${PastDateCheck.Warning}
      ${false}          | ${'2026-10-30'}   | ${'2026-10-01'} | ${PastDateCheck.NotEnforcementCase}
      ${false}          | ${'2026-10-01'}   | ${'2026-10-30'} | ${PastDateCheck.Allowed}
    `(
      'returns $expected for enforcement case=$isEnforcementCase, original date=$originalStartDate, new date=$startDate',
      ({ isEnforcementCase, originalStartDate, startDate, expected }) => {
        expect(
          checkAmendedPastDate({ isEnforcementCase, originalStartDate, startDate, today })
        ).toBe(expected);
      }
    );

    it('treats an unchanged date as unchanged when only the time of day differs', () => {
      expect(
        checkAmendedPastDate({
          isEnforcementCase: false,
          originalStartDate: '2026-10-10T09:00:00Z',
          startDate: '2026-10-10',
          today
        })
      ).toBe(PastDateCheck.Allowed);
    });
  });
});
