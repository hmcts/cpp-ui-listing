import { Params } from '@angular/router';
import { SchedulingFilters, SchedulingSlotAllocationSubmit } from '@cpp/scheduling';
import { AllocateHearingFilters, HearingType } from '../../core/model/hearing';

export type AllocateHearingParams = SchedulingSlotAllocationSubmit;

export const filtersForMagistratesAllocateSearch = ({
  businessType
}: Partial<SchedulingFilters>): AllocateHearingFilters => {
  const filters: AllocateHearingFilters = {};
  if (businessType) {
    filters.bookingType = businessType;
  }
  return filters;
};

export const filtersForCrownAllocateSearch = ({
  businessType,
  sessionEndDate,
  isMultiday
}: Partial<SchedulingFilters>): AllocateHearingFilters => {
  const filters: AllocateHearingFilters = {};
  if (businessType) {
    filters.bookingType = businessType;
  }
  if (isMultiday && sessionEndDate) {
    filters.endDate = sessionEndDate;
  }
  return filters;
};

export function redirectAfterAllocate(queryParams: Params): string[] {
  const { isUnscheduled, allocated } = queryParams;
  if (isUnscheduled) {
    return ['/unscheduled'];
  }
  if (allocated === 'true') {
    return ['/allocated'];
  }
  return ['/unallocated'];
}

type SlotAllocatePayload = {
  hearingId: string;
  hearingSlotAllocations: AllocateHearingParams['hearingSlotAllocations'];
  hearingType?: HearingType;
  filters?: AllocateHearingFilters;
  redirectTo: string[];
  sendNotificationToParties: boolean;
};

export function buildSlotAllocatePayload({
  submit: { hearingSlotAllocations, sendNotificationToParties, hearingType },
  hearingId,
  queryParams,
  filters
}: {
  submit: AllocateHearingParams;
  hearingId: string;
  queryParams: Params;
  filters?: AllocateHearingFilters;
}): SlotAllocatePayload {
  return {
    hearingId,
    hearingSlotAllocations,
    hearingType: hearingType
      ? { id: hearingType.id, description: hearingType.hearingDescription }
      : undefined,
    sendNotificationToParties: sendNotificationToParties ?? false,
    filters,
    redirectTo: redirectAfterAllocate(queryParams)
  };
}
