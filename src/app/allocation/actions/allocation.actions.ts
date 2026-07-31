import { createAction, props } from '@ngrx/store';
import { AllocateHearingFilters } from '../../core';
import { HearingSlotAllocation } from '@cpp/scheduling';

export const allocateMagistratesHearing = createAction(
  'ALLOCATE_MAGISTRATES_HEARING',
  props<{
    hearingId: string;
    hearingSlotAllocations: HearingSlotAllocation[];
    filters?: AllocateHearingFilters;
    redirectTo: string[];
    sendNotificationToParties: boolean;
  }>()
);
