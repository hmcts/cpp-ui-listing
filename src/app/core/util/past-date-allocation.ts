import { Hearing } from '../model/hearing';
import { getCPPDate } from './cpp-date';

// Enforcement cases are identified by the prosecuting authority (prosecutor short name 'ENFORC').
export const ENFORCEMENT_AUTHORITY_CODE = 'ENFORC';
export const ENFORCEMENT_BUSINESS_TYPE_CODE = 'ENF';
export const MAX_DAYS_IN_PAST_FOR_ENFORCEMENT = 31;

const dateUtil = getCPPDate();

export enum PastDateCheck {
  Allowed = 'ALLOWED',
  Warning = 'WARNING',
  TooFarInPast = 'TOO_FAR_IN_PAST',
  NotEnforcementCase = 'NOT_ENFORCEMENT_CASE',
  NotEnforcementBusinessType = 'NOT_ENFORCEMENT_BUSINESS_TYPE'
}

export const PAST_DATE_MESSAGES = {
  warning: 'THIS DATE IS IN THE PAST ARE YOU SURE YOU WANT TO CONTINUE',
  [PastDateCheck.TooFarInPast]: `Date can't be more than ${MAX_DAYS_IN_PAST_FOR_ENFORCEMENT} days in past — enter a valid date`,
  [PastDateCheck.NotEnforcementCase]:
    'INVALID DATE — past-dated hearing allocation is only available for Enforcement cases',
  [PastDateCheck.NotEnforcementBusinessType]:
    'INVALID DATE — past-dated hearing allocation is only available for Business Type = Enforcement'
};

export function isEnforcementHearing(hearing?: Pick<Hearing, 'listedCases'>): boolean {
  const listedCases = hearing?.listedCases ?? [];
  return (
    listedCases.length > 0 &&
    listedCases.every(
      ({ caseIdentifier }) => caseIdentifier?.authorityCode === ENFORCEMENT_AUTHORITY_CODE
    )
  );
}

export function getEarliestEnforcementDate(today: string): string {
  return dateUtil.format(dateUtil.subtract(today, MAX_DAYS_IN_PAST_FOR_ENFORCEMENT));
}

/**
 * Applies the past-dated allocation rule. Dates are calendar days in 'YYYY-MM-DD' format.
 */
export function checkPastDate({
  isEnforcementCase,
  businessType,
  startDate,
  today
}: {
  isEnforcementCase: boolean;
  businessType?: string;
  startDate: string;
  today: string;
}): PastDateCheck {
  if (!dateUtil.isBeforeDay(startDate, today)) {
    return PastDateCheck.Allowed;
  }
  if (!isEnforcementCase) {
    return PastDateCheck.NotEnforcementCase;
  }
  if (businessType !== ENFORCEMENT_BUSINESS_TYPE_CODE) {
    return PastDateCheck.NotEnforcementBusinessType;
  }
  if (dateUtil.isBeforeDay(startDate, getEarliestEnforcementDate(today))) {
    return PastDateCheck.TooFarInPast;
  }
  return PastDateCheck.Warning;
}

/**
 * Applies the past-dated allocation rule when amending an allocated hearing. The rule only applies
 * when the start date changes. An allocated hearing does not carry a Business Type, so the
 * Enforcement Business Type is assumed and only the case and date rules are checked.
 */
export function checkAmendedPastDate({
  isEnforcementCase,
  originalStartDate,
  startDate,
  today
}: {
  isEnforcementCase: boolean;
  originalStartDate?: string;
  startDate: string;
  today: string;
}): PastDateCheck {
  if (
    originalStartDate &&
    startDate &&
    dateUtil.isSame(startDate, originalStartDate, dateUtil.DAY)
  ) {
    return PastDateCheck.Allowed;
  }
  return checkPastDate({
    isEnforcementCase,
    businessType: ENFORCEMENT_BUSINESS_TYPE_CODE,
    startDate,
    today
  });
}
