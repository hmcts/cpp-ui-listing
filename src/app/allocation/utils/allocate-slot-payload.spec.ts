import { Params } from '@angular/router';
import { HearingSlotAllocation } from '@cpp/scheduling';
import {
  buildSlotAllocatePayload,
  filtersForCrownAllocateSearch,
  filtersForMagistratesAllocateSearch,
  redirectAfterAllocate
} from './allocate-slot-payload';

describe('allocate-slot-payload', () => {
  describe('filtersForMagistratesAllocateSearch', () => {
    it('returns empty filters when businessType is absent', () => {
      expect(filtersForMagistratesAllocateSearch({})).toEqual({});
    });

    it('maps businessType to bookingType', () => {
      expect(filtersForMagistratesAllocateSearch({ businessType: 'HEARINGTYPE002' })).toEqual({
        bookingType: 'HEARINGTYPE002'
      });
    });
  });

  describe('filtersForCrownAllocateSearch', () => {
    it('returns empty filters when businessType and sessionEndDate are absent', () => {
      expect(filtersForCrownAllocateSearch({})).toEqual({});
    });

    it('maps businessType to bookingType and sessionEndDate to endDate when multiday', () => {
      expect(
        filtersForCrownAllocateSearch({
          businessType: 'HEARINGTYPE002',
          sessionEndDate: '2019-03-31',
          isMultiday: true
        })
      ).toEqual({
        bookingType: 'HEARINGTYPE002',
        endDate: '2019-03-31'
      });
    });

    it('sets only bookingType when sessionEndDate is absent', () => {
      expect(filtersForCrownAllocateSearch({ businessType: 'X' })).toEqual({ bookingType: 'X' });
    });

    it('sets only endDate when businessType is absent and multiday', () => {
      expect(
        filtersForCrownAllocateSearch({ sessionEndDate: '2020-01-15', isMultiday: true })
      ).toEqual({
        endDate: '2020-01-15'
      });
    });

    it('does not map sessionEndDate to endDate when single-day', () => {
      expect(
        filtersForCrownAllocateSearch({
          businessType: 'HEARINGTYPE002',
          sessionEndDate: '2019-03-31',
          isMultiday: false
        })
      ).toEqual({
        bookingType: 'HEARINGTYPE002'
      });
    });
  });

  describe('buildSlotAllocatePayload', () => {
    it('passes through allocations, filters, default sendNotificationToParties, and redirect', () => {
      const hearingSlotAllocations = [
        { hearingSlot: { courtScheduleId: '1' } } as HearingSlotAllocation
      ];
      const payload = buildSlotAllocatePayload({
        hearingId: 'H1',
        submit: { hearingSlotAllocations, sendNotificationToParties: true },
        queryParams: {} as Params,
        filters: { bookingType: 'T' }
      });
      expect(payload).toEqual({
        hearingId: 'H1',
        hearingSlotAllocations,
        sendNotificationToParties: true,
        filters: { bookingType: 'T' },
        redirectTo: ['/unallocated']
      });
    });

    it('defaults sendNotificationToParties to false when omitted', () => {
      const hearingSlotAllocations = [] as HearingSlotAllocation[];
      expect(
        buildSlotAllocatePayload({
          hearingId: 'H1',
          submit: { hearingSlotAllocations },
          queryParams: { allocated: 'true' } as Params
        }).sendNotificationToParties
      ).toBe(false);
    });
  });

  describe('redirectAfterAllocate', () => {
    it('matches legacy routes', () => {
      expect(redirectAfterAllocate({ isUnscheduled: true } as Params)).toEqual(['/unscheduled']);
      expect(redirectAfterAllocate({ allocated: 'true' } as Params)).toEqual(['/allocated']);
      expect(redirectAfterAllocate({} as Params)).toEqual(['/unallocated']);
    });
  });
});
