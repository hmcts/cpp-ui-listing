import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Params, Router } from '@angular/router';
import { createSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HearingType, OrganisationUnit } from '@cpp/reference-data';
import { cold } from 'jasmine-marbles';
import { CPPDate } from '../../../core/util';
import {
  CourtCalendarFilters,
  getCourtCalendarFilters,
  getHearingTypeFor,
  getSelectedCourtFor
} from '../../state';
import { getUnallocatedHearings } from '../../state/actions/court-calendar.actions';
import { getUnallocatedHearingsGuard } from '../get-unallocated-hearings.guard';

jest.mock('../../state', () => ({
  ...jest.requireActual('../../state'),
  getSelectedCourtFor: jest.fn(),
  getHearingTypeFor: jest.fn()
}));

describe('getUnallocatedHearingsGuard', () => {
  let mockStore: MockStore;
  let mockNavigate: jest.Mock;

  const courtCentre = {
    id: 'courtCentreId',
    oucode: 'B01EF00',
    oucodeL3Name: 'Lavender hill court',
    courtrooms: []
  } as unknown as OrganisationUnit;

  const hearingType = { id: 'hearingTypeId', hearingDescription: 'Trial' } as HearingType;

  const storedFilters: CourtCalendarFilters = {
    courtCentre,
    courtType: 'CROWN',
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    businessType: 'APP',
    courtRoomId: 'courtRoomId',
    courtSession: 'AM',
    hearingType
  };

  const createActivatedRouteSnapshot = (params: Params = {}, queryParams: Params = {}) =>
    ({ params, queryParams }) as ActivatedRouteSnapshot;

  const runGuard = (snapshot: ActivatedRouteSnapshot) =>
    TestBed.runInInjectionContext(() => getUnallocatedHearingsGuard(snapshot, null));

  beforeEach(() => {
    mockNavigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: Router,
          useValue: {
            navigate: mockNavigate
          }
        }
      ]
    });

    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(getCourtCalendarFilters, storedFilters);
    jest.mocked(getSelectedCourtFor).mockReturnValue(createSelector(() => courtCentre));
    jest.mocked(getHearingTypeFor).mockReturnValue(createSelector(() => hearingType));
    jest.spyOn(mockStore, 'dispatch');
  });

  afterEach(() => {
    mockStore.resetSelectors();
  });

  it('should redirect to the court calendar when there is no court centre id', () => {
    const result = runGuard(createActivatedRouteSnapshot());

    expect(result).toBeObservable(cold('(a|)', { a: false }));
    expect(mockNavigate).toHaveBeenCalledWith(['/court-calendar']);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should redirect to the court calendar when the court centre cannot be found', () => {
    mockStore.overrideSelector(getCourtCalendarFilters, undefined);
    jest.mocked(getSelectedCourtFor).mockReturnValue(createSelector(() => undefined));

    const result = runGuard(createActivatedRouteSnapshot({ courtCentreId: 'courtCentreId' }));

    expect(result).toBeObservable(cold('(a|)', { a: false }));
    expect(mockNavigate).toHaveBeenCalledWith(['/court-calendar']);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should search unallocated hearings with the business type and hearing type from the court calendar filters', () => {
    const result = runGuard(
      createActivatedRouteSnapshot(
        { courtCentreId: 'courtCentreId' },
        { businessType: 'BAIL', hearingType: 'otherHearingTypeId' }
      )
    );

    expect(result).toBeObservable(cold('(a|)', { a: true }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      getUnallocatedHearings({
        filterOptions: {
          ...storedFilters,
          pageNumber: 1,
          pageSize: 40
        }
      })
    );
  });

  it('should fall back to the query params when there are no court calendar filters', () => {
    mockStore.overrideSelector(getCourtCalendarFilters, undefined);

    const result = runGuard(
      createActivatedRouteSnapshot(
        { courtCentreId: 'courtCentreId' },
        {
          startDate: '2026-10-01',
          endDate: '2026-10-07',
          jurisdiction: 'MAGISTRATES',
          businessType: 'BAIL',
          courtRoomId: 'courtRoomId',
          courtSession: 'PM',
          hearingType: 'hearingTypeId'
        }
      )
    );

    expect(result).toBeObservable(cold('(a|)', { a: true }));
    expect(getSelectedCourtFor).toHaveBeenCalledWith('courtCentreId');
    expect(getHearingTypeFor).toHaveBeenCalledWith('hearingTypeId');
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      getUnallocatedHearings({
        filterOptions: {
          courtCentre,
          startDate: '2026-10-01',
          endDate: '2026-10-07',
          courtType: 'MAGISTRATES',
          courtSession: 'PM',
          businessType: 'BAIL',
          courtRoomId: 'courtRoomId',
          hearingType,
          pageNumber: 1,
          pageSize: 40
        }
      })
    );
  });

  it('should not filter by business type when no business type is selected', () => {
    mockStore.overrideSelector(getCourtCalendarFilters, {
      ...storedFilters,
      businessType: undefined
    });

    const result = runGuard(createActivatedRouteSnapshot({ courtCentreId: 'courtCentreId' }));

    expect(result).toBeObservable(cold('(a|)', { a: true }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      getUnallocatedHearings({
        filterOptions: expect.objectContaining({ businessType: undefined })
      })
    );
  });

  it('should default the start date to today and the end date to the start date', () => {
    mockStore.overrideSelector(getCourtCalendarFilters, undefined);
    const today = TestBed.inject(CPPDate).format(new Date());

    const result = runGuard(createActivatedRouteSnapshot({ courtCentreId: 'courtCentreId' }));

    expect(result).toBeObservable(cold('(a|)', { a: true }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      getUnallocatedHearings({
        filterOptions: expect.objectContaining({ startDate: today, endDate: today })
      })
    );
  });
});
