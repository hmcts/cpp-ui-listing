import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, pipe } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CrownSessionStatus, HearingSlot, SchedulingService } from '@cpp/scheduling';
import { getOrganisationUnits } from '@cpp/reference-data';
import { AppState, Hearing } from '../../../core';
import { getSelectedHearing } from '../../state/selectors/court-calendar.selectors';
import { withErrorHandlerAdapter } from '../../../shared/signal-store/with-error-handler-adapter.feature';

export interface HearingSessionsRequest {
  hearing: Hearing;
  ouCode: string;
}

export interface ChangeHearingDetailsState {
  startDate: string | null;
  hearingSlots: HearingSlot[];
}

const initialState: ChangeHearingDetailsState = {
  startDate: null,
  hearingSlots: []
};

const isMultiDayHearing = ({ hearingDayCount, hearingDays }: Hearing): boolean =>
  hearingDayCount ? hearingDayCount > 1 : hearingDays.length > 1;

export const ChangeHearingDetailsStore = signalStore(
  withErrorHandlerAdapter(),
  withState<ChangeHearingDetailsState>(initialState),
  withComputed(({ startDate, hearingSlots }) => ({
    startDateSessions: computed(() =>
      hearingSlots().filter(({ sessionDate }) => sessionDate === startDate())
    )
  })),
  withMethods((store, schedulingService = inject(SchedulingService)) => ({
    loadHearingSlots: rxMethod<HearingSessionsRequest | null>(
      pipe(
        filter((request): request is HearingSessionsRequest => !!request),
        switchMap(({ hearing, ouCode }) => {
          const { jurisdictionType, startDate, endDate, courtRoomId } = hearing;
          patchState(store, { startDate, hearingSlots: [] });

          if (jurisdictionType === 'MAGISTRATES' && isMultiDayHearing(hearing)) {
            return EMPTY;
          }

          return schedulingService
            .searchHearingSlots({
              sessionStartDate: startDate,
              sessionEndDate: endDate,
              courtRoomId,
              panel: 'ADULT,YOUTH',
              ouCode,
              pageSize: 500,
              pageNumber: 1,
              showOverbookedSlots: true,
              jurisdiction: jurisdictionType,
              status: jurisdictionType === 'CROWN' ? CrownSessionStatus.FINAL : undefined
            })
            .pipe(
              tapResponse({
                next: ({ hearingSlots }) => patchState(store, { hearingSlots }),
                error: (err: HttpErrorResponse) => store.handleError(err)
              })
            );
        })
      )
    ),
    reset(): void {
      patchState(store, initialState);
    }
  })),
  withHooks({
    onInit(store) {
      const ngrxStore = inject(Store<AppState>);
      const selectedHearing = ngrxStore.selectSignal(getSelectedHearing);
      const courtCentres = ngrxStore.selectSignal(getOrganisationUnits);
      const request = computed<HearingSessionsRequest | null>(() => {
        const hearing = selectedHearing() as Hearing;
        const courtCentre = (courtCentres() ?? []).find(({ id }) => id === hearing?.courtCentreId);
        return hearing && courtCentre ? { hearing, ouCode: courtCentre.oucode } : null;
      });
      store.loadHearingSlots(request);
    }
  })
);
