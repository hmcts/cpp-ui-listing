import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { of, throwError } from 'rxjs';
import { ApiError, Hearing, ListingService } from '../../../../core';
import { provideMockStore } from '@ngrx/store/testing';
import { AppState } from '../../../../core';
import { withErrorHandlerAdapter } from '../../../../shared/signal-store/with-error-handler-adapter.feature';
import { withHearingEndDateStore } from '../with-hearing-end-date-store.feature';
import { Store } from '@ngrx/store';

const TestStore = signalStore(withErrorHandlerAdapter(), withHearingEndDateStore());

const hearing = {
  id: 'hearing-1',
  courtCentreId: 'court-centre-1',
  courtRoomId: 'court-room-1',
  jurisdictionType: 'CROWN',
  startDate: '2026-01-12',
  endDate: '2026-01-15',
  hearingDayCount: 4,
  nonDefaultDays: [{ startTime: '2026-01-12T09:00:00.000Z' }],
  nonSittingDays: []
} as unknown as Hearing;

describe('withHearingEndDateStore', () => {
  let store: InstanceType<typeof TestStore>;
  let updateAllocatedHearing: jest.Mock;
  let dispatchSpy: jest.SpyInstance;
  let onSuccess: jest.Mock;

  beforeEach(() => {
    updateAllocatedHearing = jest.fn();
    onSuccess = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        TestStore,
        provideMockStore<AppState>({ initialState: {} as AppState }),
        { provide: ListingService, useValue: { updateAllocatedHearing } }
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
    dispatchSpy = jest.spyOn(TestBed.inject(Store), 'dispatch');
    jest.clearAllMocks();
  });

  it('should send the hearing back with only its end date replaced', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({ hearing, newEndDate: '2026-01-20', onSuccess });
    flush();

    expect(updateAllocatedHearing).toHaveBeenCalledWith({
      ...hearing,
      endDate: '2026-01-20'
    });
  }));

  it('should report the previous and new end dates to the caller on success', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({ hearing, newEndDate: '2026-01-20', onSuccess });
    flush();

    expect(onSuccess).toHaveBeenCalledWith({
      previousEndDate: '2026-01-15',
      newEndDate: '2026-01-20'
    });
    expect(dispatchSpy).not.toHaveBeenCalled();
  }));

  it('should default missing nonDefaultDays to an empty list', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));
    const { nonDefaultDays, ...hearingWithoutNonDefaultDays } = hearing;

    store.changeHearingEndDate({
      hearing: hearingWithoutNonDefaultDays as Hearing,
      newEndDate: '2026-01-20',
      onSuccess
    });
    flush();

    expect(updateAllocatedHearing).toHaveBeenCalledWith(
      expect.objectContaining({ nonDefaultDays: [] })
    );
    expect(onSuccess).toHaveBeenCalled();
  }));

  it('should hand the error to the global error handler and not call back on failure', fakeAsync(() => {
    const error = { status: 500 };
    updateAllocatedHearing.mockReturnValue(throwError(() => error));

    store.changeHearingEndDate({ hearing, newEndDate: '2026-01-20', onSuccess });
    flush();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(new ApiError(error as any));
  }));
});
