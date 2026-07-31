import { CrownSessionStatus, SearchHearingSlotsParams } from '@cpp/scheduling';
import { Jurisdiction } from '@cpp/reference-data';

export const buildHearingScheduleParams = (
  overrides: Partial<SearchHearingSlotsParams> & {
    sessionStartDate: string;
    ouCode: string;
    jurisdiction: Jurisdiction;
    status: CrownSessionStatus | undefined;
  }
): SearchHearingSlotsParams & { isSlotBased: boolean } => ({
  sessionEndDate: overrides.sessionStartDate,
  panel: 'ADULT,YOUTH',
  pageSize: 500,
  pageNumber: 1,
  showOverbookedSlots: true,
  isSlotBased: false,
  ...overrides
});
