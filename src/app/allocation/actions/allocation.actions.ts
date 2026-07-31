import { createAction, props } from '@ngrx/store';
import { HearingSlotAllocation } from '@cpp/scheduling';
import { AllocateHearingFilters, HearingType } from '../../core/model/hearing';

export const allocateHearing = createAction(
  'ALLOCATE_HEARING',
  props<{
    hearingId: string;
    hearingSlotAllocations: HearingSlotAllocation[];
    hearingType?: HearingType;
    filters?: AllocateHearingFilters;
    redirectTo: string[];
    sendNotificationToParties: boolean;
  }>()
);
