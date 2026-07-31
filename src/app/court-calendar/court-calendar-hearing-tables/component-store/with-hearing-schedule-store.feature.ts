import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { SchedulingService } from '@cpp/scheduling';
import { Jurisdiction } from '@cpp/reference-data';
import { AppState, JurisdictionType } from '../../../core';
import { getAllocateWidgetFilter, getCourtCalendarFilters } from '../../state';
import { SelectedHearingState } from './with-hearing-selection-store.feature';
import { buildHearingScheduleParams } from '../../utils/hearing-schedule-params.util';
import { CrownSessionStatus } from '@cpp/scheduling';

interface HearingScheduleState {
  eligibleScheduleIds: string[] | null | undefined;
}

interface BaseDependencyState {
  selectedHearings: SelectedHearingState[];
}

const initialState: HearingScheduleState = {
  eligibleScheduleIds: null
};

export function withHearingScheduleStore<_>() {
  return signalStoreFeature(
    {
      state: type<BaseDependencyState>()
    },
    withState<HearingScheduleState>(initialState),
    withMethods(
      (
        store,
        schedulingService = inject(SchedulingService),
        ngrxStore = inject(Store<AppState>)
      ) => ({
        loadEligibleSchedules: rxMethod<{
          selectedHearings: SelectedHearingState[] | undefined;
          jurisdiction: JurisdictionType;
        }>(
          pipe(
            switchMap(({ selectedHearings, jurisdiction }) => {
              const hasMultiDayHearings =
                selectedHearings?.some(h => (h.duration ?? 0) > 360) ?? false;

              if (jurisdiction !== 'CROWN') {
                patchState(store, {
                  eligibleScheduleIds: hasMultiDayHearings ? [] : null
                });
                return EMPTY;
              }

              if (!hasMultiDayHearings) {
                patchState(store, { eligibleScheduleIds: null });
                return EMPTY;
              }

              const widgetFilter = ngrxStore.selectSignal(getAllocateWidgetFilter)();
              if (!widgetFilter?.startDate) {
                return EMPTY;
              }

              patchState(store, { eligibleScheduleIds: undefined });

              const maxDuration = Math.max(...(selectedHearings ?? []).map(h => h.duration ?? 0));
              const params = buildHearingScheduleParams({
                sessionStartDate: widgetFilter.startDate,
                ouCode: widgetFilter.courtCentre.oucode,
                businessType: widgetFilter.businessType ?? undefined,
                courtSession: 'AD',
                jurisdiction: jurisdiction as Jurisdiction,
                status: CrownSessionStatus.FINAL,
                availableDurationMins: maxDuration
              });

              return schedulingService.searchHearingSlots(params, true).pipe(
                tapResponse({
                  next: ({ hearingSlots }) => {
                    const eligible = hearingSlots
                      .filter(s => s.sessionDate === widgetFilter.startDate)
                      .map(s => s.courtScheduleId);
                    patchState(store, { eligibleScheduleIds: eligible });
                  },
                  error: (_: HttpErrorResponse) => {
                    patchState(store, { eligibleScheduleIds: [] });
                  }
                })
              );
            })
          )
        )
      })
    ),
    withHooks({
      onInit(store) {
        const ngrxStore = inject(Store<AppState>);
        const filters = ngrxStore.selectSignal(getCourtCalendarFilters);
        const params = computed(() => ({
          selectedHearings: store.selectedHearings(),
          jurisdiction: filters()?.courtType
        }));
        store.loadEligibleSchedules(params);
      }
    })
  );
}
