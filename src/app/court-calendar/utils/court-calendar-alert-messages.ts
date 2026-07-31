import { formatDate } from '@angular/common';

export const COURT_CALENDAR_ALERTS = {
  ALLOCATE_TOTAL_FAILURE: 'Hearings could not be allocated. Try again.',
  UNALLOCATE_SUCCESS: 'Hearing(s) have been successfully unallocated.',
  UNALLOCATE_TOTAL_FAILURE: 'Hearings could not be unallocated. Try again.',

  resolveEndDateChange(previousEndDate: string, newEndDate: string): { successAlert: string } {
    return {
      successAlert: `Hearing date successfully changed from ${formatDate(previousEndDate, 'd MMMM yyyy', 'en-GB')} to ${formatDate(newEndDate, 'd MMMM yyyy', 'en-GB')}`
    };
  },

  resolveUnallocate(
    processedCount: number,
    failedAllocationIds: string[]
  ): { successAlert?: string; failureAlert?: string } {
    if (processedCount === 0 && failedAllocationIds.length > 0) {
      return {
        failureAlert:
          failedAllocationIds.length === 1
            ? 'There are no draft sessions to move this hearing, please create draft sessions with this date and courtroom.'
            : 'There are no draft sessions to move these hearings, please create draft sessions with this date and courtroom.'
      };
    }
    if (failedAllocationIds.length > 0 && failedAllocationIds.length >= processedCount) {
      return { failureAlert: COURT_CALENDAR_ALERTS.UNALLOCATE_TOTAL_FAILURE };
    }
    if (failedAllocationIds.length > 0) {
      return {
        failureAlert: `${failedAllocationIds.length} of ${processedCount} hearings could not be unallocated. Try again.`
      };
    }
    return { successAlert: COURT_CALENDAR_ALERTS.UNALLOCATE_SUCCESS };
  }
};
