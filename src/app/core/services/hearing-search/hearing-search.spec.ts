import { TestBed } from '@angular/core/testing';
import { cold } from 'jasmine-marbles';
import { HearingSearchService } from './hearing-search';
import {
  hearingsForDateRangeSearch,
  sequencedHearing4,
  sequencedHearingsForSingleSearchDate,
  courtCentreId1,
  searchDate,
  courtCentres,
  startDate,
  endDate,
  expectedSequenceHearingForSingleDatePayload,
  expectedSequenceHearingForMultipleDatesPayload,
  sequencedHearingsForMultipleSearchDates,
  hearingsForSingleDateSearch
} from './mock-data';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';
import { ListingService } from '../listing/listing.service';
import { HearingDay, PaginatedHearingResponse } from '../..';
import { expectedSequenceHearingForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom } from './mock-data';
import {
  hearingsForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom,
  sequencedHearingsForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom
} from './mock-data';

describe('HearingSearchService', () => {
  describe('#HearingSearchService', () => {
    let service: HearingSearchService;
    let storeService: Store<AppState>;
    const select = jasmine.createSpy('selectSpy');
    const dispatch = jasmine.createSpy('dispatchSpy');
    const searchHearingsWithTimeRange = jasmine.createSpy('searchHearingsWithTimeRange');
    const getAllocatedHearings = jasmine.createSpy('getAllocatedHearings');

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [
          HearingSearchService,
          {
            provide: ListingService,
            useValue: {
              searchHearingsWithTimeRange,
              getAllocatedHearings
            }
          },
          {
            provide: Store,
            useValue: {
              select,
              dispatch
            }
          }
        ],
        teardown: { destroyAfterEach: false }
      });

      select.and.returnValue(cold('-a|', { a: courtCentres }));
      storeService = TestBed.inject(Store);
      service = TestBed.inject(HearingSearchService);
    });

    describe('search tests', () => {
      it('#searchHearingsWithTimeRange - Single date search', () => {
        const listingServiceResponse$ = cold('-a|', {
          a: { hearings: hearingsForSingleDateSearch, notes: [{ id: 'note-id' }] }
        });
        const expected$ = cold('-b|', {
          b: { hearings: sequencedHearingsForSingleSearchDate, notes: [{ id: 'note-id' }] }
        });

        searchHearingsWithTimeRange.and.returnValue(listingServiceResponse$);
        const searchOptions = { courtCentreId: courtCentreId1, searchDate };

        expect(service.searchHearingsWithTimeRange(searchOptions)).toBeObservable(expected$);
        expect(searchHearingsWithTimeRange.calls.mostRecent().args[0]).toEqual(searchOptions);
        expect(storeService.dispatch).toHaveBeenCalled();
        expect(storeService.dispatch).toBeCalledWith(expectedSequenceHearingForSingleDatePayload);
      });

      it('#searchHearingsWithTimeRange - with sequenceHearing should not dispatch action', () => {
        dispatch.calls.reset();
        const listingServiceResponse$ = cold('-a|', {
          a: { hearings: sequencedHearing4, notes: [{ id: 'note-id' }] }
        });
        const expected$ = cold('-b|', {
          b: { hearings: sequencedHearing4, notes: [{ id: 'note-id' }] }
        });

        searchHearingsWithTimeRange.and.returnValue(listingServiceResponse$);
        const searchOptions = { courtCentreId: courtCentreId1, searchDate };

        expect(service.searchHearingsWithTimeRange(searchOptions)).toBeObservable(expected$);
        expect(searchHearingsWithTimeRange.calls.mostRecent().args[0]).toEqual(searchOptions);
        expect(storeService.dispatch).not.toHaveBeenCalled();
      });

      it('#getAllocatedHearings', () => {
        const listingServiceResponse$ = cold('-a|', {
          a: {
            hearings: hearingsForDateRangeSearch,
            results: 100,
            pageCount: 2
          } as PaginatedHearingResponse
        });
        const expected$ = cold('-b|', {
          b: {
            hearings: sequencedHearingsForMultipleSearchDates,
            results: 100,
            pageCount: 2
          } as PaginatedHearingResponse
        });
        getAllocatedHearings.and.returnValue(listingServiceResponse$);
        const searchOptions = {
          courtCentreId: courtCentreId1,
          startDate,
          endDate
        };

        expect(service.getAllocatedHearings(searchOptions)).toBeObservable(expected$);
        expect(getAllocatedHearings.calls.mostRecent().args[0]).toEqual(searchOptions);
        expect(storeService.dispatch).toHaveBeenCalled();
        expect(storeService.dispatch).toBeCalledWith(
          expectedSequenceHearingForMultipleDatesPayload
        );
      });

      it('#getAllocatedHearings - correctly sequence where start sequences are zero and at least two hearings have the same date and court centre but different court rooms', () => {
        dispatch.calls.reset();
        const listingServiceResponse$ = cold('-a|', {
          a: {
            hearings: hearingsForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom,
            results: 100,
            pageCount: 2
          } as PaginatedHearingResponse
        });
        const expected$ = cold('-b|', {
          b: {
            hearings:
              sequencedHearingsForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom,
            results: 100,
            pageCount: 2
          } as PaginatedHearingResponse
        });
        getAllocatedHearings.and.returnValue(listingServiceResponse$);
        const searchOptions = {
          courtCentreId: courtCentreId1,
          startDate,
          endDate
        };

        expect(service.getAllocatedHearings(searchOptions)).toBeObservable(expected$);
        expect(getAllocatedHearings.calls.mostRecent().args[0]).toEqual(searchOptions);
        expect(storeService.dispatch).toHaveBeenCalled();
        expect(storeService.dispatch).toBeCalledWith(
          expectedSequenceHearingForSingleDateSearchSameDateAndCourtCentreButDifferentCourtRoom
        );
      });

      it('Sequencing :standard sort with zero', () => {
        const actual = [
          {
            endTime: '2019-10-18T09:45:00.000Z',
            sequence: 2,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 2',
            durationMinutes: 30
          },
          {
            endTime: '2019-10-18T10:00:00.000Z',
            sequence: 0,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 0',
            durationMinutes: 45
          },
          {
            endTime: '2019-10-18T10:00:00.000Z',
            sequence: 1,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 1',
            durationMinutes: 45
          },
          {
            endTime: '2019-10-18T10:00:00.000Z',
            sequence: 3,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 3',
            durationMinutes: 45
          },
          {
            endTime: '2019-10-18T09:45:00.000Z',
            sequence: 4,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 4',
            durationMinutes: 30
          }
        ];

        const resequenced = service.resequenceHearings(actual);
        expect(resequenced[0].hearingDate).toBe('old 1');
        expect(resequenced[1].hearingDate).toBe('old 2');
        expect(resequenced[2].hearingDate).toBe('old 3');
        expect(resequenced[3].hearingDate).toBe('old 4');
        expect(resequenced[4].hearingDate).toBe('old 0');
      });
      it('Sequencing :standard sort no zero', () => {
        const actual = [
          {
            endTime: '2019-10-18T09:45:00.000Z',
            sequence: 2,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 2',
            durationMinutes: 30
          },
          {
            endTime: '2019-10-18T10:00:00.000Z',
            sequence: 1,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 1',
            durationMinutes: 45
          },
          {
            endTime: '2019-10-18T10:00:00.000Z',
            sequence: 3,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 3',
            durationMinutes: 45
          },
          {
            endTime: '2019-10-18T09:45:00.000Z',
            sequence: 4,
            startTime: '2019-10-18T09:15:00.000Z',
            hearingDate: 'old 4',
            durationMinutes: 30
          }
        ];

        const resequenced = service.resequenceHearings(actual);
        expect(resequenced[0].hearingDate).toBe('old 1');
        expect(resequenced[1].hearingDate).toBe('old 2');
        expect(resequenced[2].hearingDate).toBe('old 3');
        expect(resequenced[3].hearingDate).toBe('old 4');
      });

      it('search tests two zeros will put both at end', () => {
        const actual = [
          {
            sequence: 2,
            hearingDate: 'old 2'
          },
          {
            sequence: 1,
            hearingDate: 'old 1'
          },
          {
            sequence: 3,
            hearingDate: 'old 3'
          },
          {
            sequence: 3,
            hearingDate: 'old 3'
          },
          {
            sequence: 0,
            hearingDate: 'old 0'
          }
        ] as HearingDay[];

        const resequenced = service.resequenceHearings(actual);
        expect(resequenced[0].hearingDate).toBe('old 1');
        expect(resequenced[1].hearingDate).toBe('old 2');
        expect(resequenced[2].hearingDate).toBe('old 3');
        expect(resequenced[3].hearingDate).toBe('old 3');
        expect(resequenced[4].hearingDate).toBe('old 0');
      });

      it('search tests two zeros will put both at end', () => {
        const actual = [
          {
            sequence: 2,
            hearingDate: 'old 2'
          },
          {
            sequence: 0,
            hearingDate: 'old 0'
          },
          {
            sequence: 1,
            hearingDate: 'old 1'
          },
          {
            sequence: 3,
            hearingDate: 'old 3'
          },
          {
            sequence: 0,
            hearingDate: 'old 0'
          }
        ] as HearingDay[];

        const resequenced = service.resequenceHearings(actual);
        expect(resequenced[0].hearingDate).toBe('old 1');
        expect(resequenced[1].hearingDate).toBe('old 2');
        expect(resequenced[2].hearingDate).toBe('old 3');
        expect(resequenced[3].hearingDate).toBe('old 0');
        expect(resequenced[4].hearingDate).toBe('old 0');
      });

      it('search tests sequencing - edge case - high numbers persisted', () => {
        const actual = [
          {
            sequence: 11,
            hearingDate: 'old 11'
          },
          {
            sequence: 0,
            hearingDate: 'old 0'
          },
          {
            sequence: 12,
            hearingDate: 'old 12'
          },
          {
            sequence: 13,
            hearingDate: 'old 13'
          }
        ] as HearingDay[];

        const resequenced = service.resequenceHearings(actual);
        // ensure old sequence exists
        expect(resequenced[0].hearingDate).toBe('old 11');
        expect(resequenced[1].hearingDate).toBe('old 12');
        expect(resequenced[2].hearingDate).toBe('old 13');
        expect(resequenced[3].hearingDate).toBe('old 0');
        expect(resequenced[0].sequence).toBe(11);
        expect(resequenced[1].sequence).toBe(12);
        expect(resequenced[2].sequence).toBe(13);
        expect(resequenced[3].sequence).toBe(14);
      });
    });
  });
});
