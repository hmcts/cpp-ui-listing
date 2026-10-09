import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';
import { CrownSessionStatus, HearingSlot, SchedulingService } from '@cpp/scheduling';
import { ApiError, Hearing } from '../../../../core';
import { getSelectedHearing } from '../../../state/selectors/court-calendar.selectors';
import { selectedHearing } from '../../../utils/mocks';
import { ChangeHearingDetailsStore } from '../change-hearing-details.store';

const courtCentreId = 'court-centre-1';
const courtRoomId = 'court-room-1';
const referenceDataState = {
  referenceData: { organisationUnits: [{ id: courtCentreId, oucode: 'C01CY00' }] }
};

const buildHearing = (overrides: Partial<Hearing>): Hearing =>
  ({
    ...(selectedHearing as Hearing),
    courtCentreId,
    courtRoomId,
    hearingDayCount: undefined,
    ...overrides
  }) as Hearing;

const crownMultiDayHearing = buildHearing({
  jurisdictionType: 'CROWN',
  startDate: '2026-10-12',
  endDate: '2026-10-14',
  hearingDayCount: 3
});

const slot = (courtScheduleId: string, sessionDate: string, businessType: string) =>
  ({ courtScheduleId, sessionDate, businessType, courtRoomId }) as HearingSlot;

const slotsAcrossHearingRange = [
  slot('lng-12', '2026-10-12', 'LNG'),
  slot('nth-12', '2026-10-12', 'NTH'),
  slot('shrt-12', '2026-10-12', 'SHRT'),
  slot('lng-13', '2026-10-13', 'LNG'),
  slot('nth-14', '2026-10-14', 'NTH')
];

describe('ChangeHearingDetailsStore', () => {
  let store: InstanceType<typeof ChangeHearingDetailsStore>;
  let mockStore: MockStore;
  let searchHearingSlots: jest.Mock;

  const setup = (hearing: Hearing | null) => {
    searchHearingSlots = jest
      .fn()
      .mockReturnValue(of({ hearingSlots: slotsAcrossHearingRange, totalResults: 5 }));

    TestBed.configureTestingModule({
      providers: [
        ChangeHearingDetailsStore,
        provideMockStore({
          initialState: referenceDataState,
          selectors: [{ selector: getSelectedHearing, value: hearing }]
        }),
        { provide: SchedulingService, useValue: { searchHearingSlots } }
      ]
    });

    mockStore = TestBed.inject(MockStore);
    store = TestBed.inject(ChangeHearingDetailsStore);
    TestBed.flushEffects();
  };

  it('requests the sessions of the hearing courtroom across the hearing date range', () => {
    setup(crownMultiDayHearing);

    expect(searchHearingSlots).toHaveBeenCalledTimes(1);
    expect(searchHearingSlots).toHaveBeenCalledWith({
      sessionStartDate: '2026-10-12',
      sessionEndDate: '2026-10-14',
      courtRoomId,
      panel: 'ADULT,YOUTH',
      ouCode: 'C01CY00',
      pageSize: 500,
      pageNumber: 1,
      showOverbookedSlots: true,
      jurisdiction: 'CROWN',
      status: CrownSessionStatus.FINAL
    });
  });

  it('offers only the sessions on the hearing start date', () => {
    setup(crownMultiDayHearing);

    expect(store.hearingSlots()).toHaveLength(5);
    expect(store.startDateSessions().map(({ courtScheduleId }) => courtScheduleId)).toEqual([
      'lng-12',
      'nth-12',
      'shrt-12'
    ]);
  });

  it('offers every session of the day for a single-day hearing', () => {
    setup(
      buildHearing({
        jurisdictionType: 'CROWN',
        startDate: '2026-10-12',
        endDate: '2026-10-12',
        hearingDayCount: 1
      })
    );

    expect(store.startDateSessions()).toHaveLength(3);
  });

  it('does not filter on session status for a MAGISTRATES single-day hearing', () => {
    setup(
      buildHearing({
        jurisdictionType: 'MAGISTRATES',
        startDate: '2026-10-12',
        endDate: '2026-10-12',
        hearingDayCount: 1
      })
    );

    expect(searchHearingSlots).toHaveBeenCalledWith(
      expect.objectContaining({ jurisdiction: 'MAGISTRATES', status: undefined })
    );
  });

  it('does not request sessions for a MAGISTRATES multi-day hearing, which has no session dropdown', () => {
    setup(
      buildHearing({
        jurisdictionType: 'MAGISTRATES',
        startDate: '2026-10-12',
        endDate: '2026-10-14',
        hearingDayCount: 3
      })
    );

    expect(searchHearingSlots).not.toHaveBeenCalled();
    expect(store.startDateSessions()).toEqual([]);
  });

  it('does not request sessions until a hearing is selected', () => {
    setup(null);

    expect(searchHearingSlots).not.toHaveBeenCalled();
    expect(store.startDateSessions()).toEqual([]);
  });

  it('routes a failed session search to the global error handler', () => {
    const error = new HttpErrorResponse({ status: 500 });
    TestBed.configureTestingModule({
      providers: [
        ChangeHearingDetailsStore,
        provideMockStore({
          initialState: referenceDataState,
          selectors: [{ selector: getSelectedHearing, value: crownMultiDayHearing }]
        }),
        {
          provide: SchedulingService,
          useValue: { searchHearingSlots: jest.fn().mockReturnValue(throwError(() => error)) }
        }
      ]
    });
    mockStore = TestBed.inject(MockStore);
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

    store = TestBed.inject(ChangeHearingDetailsStore);
    TestBed.flushEffects();

    expect(dispatchSpy).toHaveBeenCalledWith(new ApiError(error));
    expect(store.startDateSessions()).toEqual([]);
  });

  it('clears the loaded sessions on reset', () => {
    setup(crownMultiDayHearing);

    store.reset();

    expect(store.hearingSlots()).toEqual([]);
    expect(store.startDateSessions()).toEqual([]);
  });
});
