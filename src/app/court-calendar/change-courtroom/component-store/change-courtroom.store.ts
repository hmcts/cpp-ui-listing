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
import { pipe } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState, Hearing, ListingService } from '../../../core';
import { getChangeCourtroomVm } from '../../state/selectors/court-calendar.selectors';
import { ChangeCourtroomVM, HearingDayVM } from '../../model';
import { CrownSessionStatus, HearingSlot, SchedulingService } from '@cpp/scheduling';
import { buildHearingScheduleParams } from '../../utils/hearing-schedule-params.util';
import { withErrorHandlerAdapter } from '../../../shared/signal-store/with-error-handler-adapter.feature';
import { AllocateHearingFactory } from '../../utils/allocate-hearing.factory';

export interface ChangeCourtroomState {
  hearingVM: ChangeCourtroomVM | null;
  selectedCourtroom: string;
  selectedHearingDays: HearingDayVM[];
  hearingSlots: HearingSlot[];
}

const initialState: ChangeCourtroomState = {
  hearingVM: null,
  selectedCourtroom: '',
  selectedHearingDays: [],
  hearingSlots: []
};

export const ChangeCourtroomStore = signalStore(
  withErrorHandlerAdapter(),
  withState<ChangeCourtroomState>(initialState),
  withComputed(({ hearingVM }) => ({
    courtRooms: computed(() =>
      (hearingVM()?.courtRooms ?? []).map(({ id, courtroomName }) => ({
        label: courtroomName,
        value: id
      }))
    ),
    upcomingHearingDays: computed(() => hearingVM()?.upComingHearingDays ?? [])
  })),
  withMethods(
    (
      store,
      schedulingService = inject(SchedulingService),
      listingService = inject(ListingService),
      allocateFactory = inject(AllocateHearingFactory)
    ) => ({
      setSelectedHearingDays(hearingDays: HearingDayVM[]): void {
        patchState(store, { selectedHearingDays: [...hearingDays] });
      },
      updateSelectedHearingDays({
        hearingDays,
        courtRoomId
      }: {
        hearingDays: HearingDayVM[];
        courtRoomId: string;
      }): void {
        const slots = store.hearingSlots();
        const selectedHearingDays = hearingDays.map(hearingDay => ({
          ...hearingDay,
          courtRoomId,
          courtScheduleId: slots.find(
            slot => slot.courtRoomId === courtRoomId && slot.sessionDate === hearingDay.hearingDate
          )?.courtScheduleId
        }));
        patchState(store, {
          selectedHearingDays,
          selectedCourtroom: courtRoomId
        });
      },
      loadHearingSlots: rxMethod<ChangeCourtroomVM | null>(
        pipe(
          filter((vm): vm is ChangeCourtroomVM => !!vm),
          switchMap(vm => {
            patchState(store, { hearingVM: vm });
            const params = buildHearingScheduleParams({
              sessionStartDate: vm.upComingHearingDays[0].hearingDate,
              sessionEndDate: vm.endDate,
              ouCode: vm.ouCode,
              jurisdiction: vm.jurisdictionType,
              status: CrownSessionStatus.FINAL,
              availableDurationMins: 360,
              pageSize: 4000
            });
            return schedulingService.searchHearingSlots(params).pipe(
              tapResponse({
                next: ({ hearingSlots }) => patchState(store, { hearingSlots }),
                error: (err: HttpErrorResponse) => store.handleError(err)
              })
            );
          })
        )
      ),
      confirmChange: rxMethod<{ selectedHearing: Hearing; onSuccess: () => void }>(
        pipe(
          switchMap(({ selectedHearing, onSuccess }) => {
            const updatedNonDefaultHearingDays = allocateFactory.parseBulkVirtualNonDefaultDays(
              selectedHearing,
              store.selectedHearingDays()
            );

            return listingService
              .updateCourtRoomForSelectedHearingDays({
                hearingId: selectedHearing.id,
                sendNotificationToParties: selectedHearing.sendNotificationToParties,
                nonDefaultDays: updatedNonDefaultHearingDays
              })
              .pipe(
                tapResponse({
                  next: () => onSuccess(),
                  error: (err: HttpErrorResponse) => store.handleError(err)
                })
              );
          })
        )
      ),
      reset(): void {
        patchState(store, initialState);
      }
    })
  ),
  withHooks({
    onInit(store) {
      const ngrxStore = inject(Store<AppState>);
      store.loadHearingSlots(ngrxStore.selectSignal(getChangeCourtroomVm));
    }
  })
);
