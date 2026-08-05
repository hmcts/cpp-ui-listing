import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { isEqual } from 'lodash-es';
import { of, throwError } from 'rxjs';
import { OrganisationUnit } from '@cpp/reference-data';
import { ApiError, CourtCentre, Hearing, ListingService } from '../../../../core';
import { provideMockStore } from '@ngrx/store/testing';
import { AppState } from '../../../../core';
import { CPPDate } from '../../../../core/util';
import { DateRange } from '../../../../shared/components/date-range/date-range';
import { ChangeHearingDetailsFormValues } from '../../../change-hearing-details/components/change-hearing-details.component';
import { AllocateHearingFactory } from '../../../utils/allocate-hearing.factory';
import { withErrorHandlerAdapter } from '../../../../shared/signal-store/with-error-handler-adapter.feature';
import { withHearingEndDateStore } from '../with-hearing-end-date-store.feature';
import { Store } from '@ngrx/store';

const TestStore = signalStore(withErrorHandlerAdapter(), withHearingEndDateStore());

const hearing = {
  id: 'hearing-1',
  type: { id: 'type-1', description: 'Trial' },
  courtCentreId: 'court-centre-1',
  courtRoomId: 'court-room-1',
  jurisdictionType: 'CROWN',
  hearingLanguage: 'ENGLISH',
  publicListNote: 'a note',
  hasVideoLink: true,
  sendNotificationToParties: true,
  estimatedMinutes: 1440,
  startDate: '2026-01-12',
  endDate: '2026-01-15',
  hearingDayCount: 4,
  hearingDays: [
    {
      hearingDate: '2026-01-12',
      startTime: '2026-01-12T09:00:00.000Z',
      durationMinutes: 360,
      courtScheduleId: 'schedule-1'
    }
  ],
  judiciary: [],
  listedCases: [],
  courtApplications: [],
  nonDefaultDays: [{ startTime: '2026-01-13T14:00:00.000Z', duration: 240 }],
  nonSittingDays: ['2026-01-14']
} as unknown as Hearing;

const organisationUnit = {
  id: 'court-centre-1',
  oucodeL3Name: 'Test Crown Court',
  oucode: 'OU-1'
} as OrganisationUnit;
const courtCentre = {
  id: 'court-centre-1',
  name: 'Test Crown Court',
  oucode: 'OU-1'
} as CourtCentre;

const NEW_END_DATE = '2026-01-20';

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

  it('should send the identical body the Change Hearing Details screen would send', fakeAsync(() => {
    const cppDate = TestBed.inject(CPPDate);
    const viaChangeHearingDetails = TestBed.inject(AllocateHearingFactory).updateAllocatedHearing(
      hearing,
      {
        hasVideoLink: hearing.hasVideoLink,
        sendNotificationToParties: hearing.sendNotificationToParties,
        hearingLanguage: hearing.hearingLanguage,
        publicListNote: hearing.publicListNote,
        nonSittingDays: hearing.nonSittingDays,
        nonDefaultDays: hearing.nonDefaultDays,
        dateRange: new DateRange(hearing.startDate, NEW_END_DATE),
        selectedHearingType: {
          id: hearing.type.id,
          hearingDescription: hearing.type.description
        },
        startTime: cppDate.format(hearing.hearingDays[0].startTime, cppDate.HOURS_MINUTES_24H),
        duration: cppDate.countWorkingDays(hearing.startDate, NEW_END_DATE) * 360,
        courtScheduleId: hearing.hearingDays[0].courtScheduleId
      } as ChangeHearingDetailsFormValues,
      courtCentre
    );
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({
      hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    expect(updateAllocatedHearing).toHaveBeenCalledWith(viaChangeHearingDetails);
  }));

  it('should change nothing on the hearing but the end date and the duration derived from it', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({
      hearing,
      newEndDate: hearing.endDate,
      courtCentre: organisationUnit,
      onSuccess
    });
    store.changeHearingEndDate({
      hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    const [[unchanged], [changed]] = updateAllocatedHearing.mock.calls;
    const differing = Object.keys(changed)
      .filter(key => !isEqual(changed[key], unchanged[key]))
      .sort();
    expect(differing).toEqual(['endDate', 'nonDefaultDays']);

    expect(changed.endDate).toBe(NEW_END_DATE);
    // nonDefaultDays only moves because the virtual day carries the recalculated duration.
    expect(changed.nonDefaultDays[0].duration).toBe(2520);
    expect(unchanged.nonDefaultDays[0].duration).toBe(1440);
    expect({ ...changed.nonDefaultDays[0], duration: 1440 }).toEqual(unchanged.nonDefaultDays[0]);
    expect(changed.nonDefaultDays.slice(1)).toEqual(unchanged.nonDefaultDays.slice(1));
  }));

  it('should carry the hearing start time and court schedule onto the virtual non default day', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({
      hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    const [virtualDay] = updateAllocatedHearing.mock.calls[0][0].nonDefaultDays;
    expect(virtualDay.virtual).toBe(true);
    expect(virtualDay.courtScheduleId).toBe('schedule-1');
    expect(virtualDay.startTime).toBe(hearing.hearingDays[0].startTime);
    expect(virtualDay.roomId).toBe('court-room-1');
  }));

  it('should keep the hearing Crown - no ouCode is sent on the selected court centre', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({
      hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    expect(updateAllocatedHearing.mock.calls[0][0].selectedCourtCentre).toEqual({
      id: 'court-centre-1',
      courtRoomId: 'court-room-1',
      courtCentreName: 'Test Crown Court',
      ouCode: undefined
    });
  }));

  it('should report the previous and new end dates to the caller on success', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));

    store.changeHearingEndDate({
      hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    expect(onSuccess).toHaveBeenCalledWith({
      previousEndDate: '2026-01-15',
      newEndDate: NEW_END_DATE
    });
    expect(dispatchSpy).not.toHaveBeenCalled();
  }));

  it('should default missing nonDefaultDays to just the virtual day', fakeAsync(() => {
    updateAllocatedHearing.mockReturnValue(of({}));
    const { nonDefaultDays, ...hearingWithoutNonDefaultDays } = hearing;

    store.changeHearingEndDate({
      hearing: hearingWithoutNonDefaultDays as Hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    expect(updateAllocatedHearing.mock.calls[0][0].nonDefaultDays).toEqual([
      expect.objectContaining({ virtual: true })
    ]);
    expect(onSuccess).toHaveBeenCalled();
  }));

  it('should hand the error to the global error handler and not call back on failure', fakeAsync(() => {
    const error = { status: 500 };
    updateAllocatedHearing.mockReturnValue(throwError(() => error));

    store.changeHearingEndDate({
      hearing,
      newEndDate: NEW_END_DATE,
      courtCentre: organisationUnit,
      onSuccess
    });
    flush();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(new ApiError(error as any));
  }));
});
