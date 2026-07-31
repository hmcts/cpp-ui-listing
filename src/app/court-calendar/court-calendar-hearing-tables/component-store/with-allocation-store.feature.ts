import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStoreFeature, type, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, forkJoin, map, pipe, switchMap, take } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { groupBy } from 'lodash-es';
import { CrownSessionStatus, SchedulingService, SearchHearingSlotsParams } from '@cpp/scheduling';
import { Jurisdiction } from '@cpp/reference-data';
import { Hearing, JurisdictionType, ListingService } from '../../../core';
import { CourtCalendarActions } from '../../state';
import { AllocateHearingFactory } from '../../utils/allocate-hearing.factory';
import { buildHearingScheduleParams } from '../../utils/hearing-schedule-params.util';
import { BulkAllocatePayload, HearingAllocationPayload } from '../../model';
import { SelectedHearingState } from './with-hearing-selection-store.feature';
import { PositionedHearingsState } from './with-hearing-move-store.feature';

export interface BulkOperationResult {
  processedHearings: HearingAllocationPayload[];
  failedAllocationIds: string[];
}

export type OnSuccessCallback = (result: BulkOperationResult) => void;

export interface SectionAllocatedToState {
  courtRoomId: string;
  date: string;
  numOfHearingsAllocated?: number;
  totalHearingsAttempted?: number;
}

interface AllocationState {
  failedAllocationIds: string[];
  sectionAllocatedTo: SectionAllocatedToState | undefined;
}

interface BaseDependencyState {
  selectedHearings: SelectedHearingState[];
  positionedHearingsState: PositionedHearingsState | undefined;
}

interface BaseDependencyMethods extends Record<string, Function> {
  handleError: (error: HttpErrorResponse) => void;
}

const initialState: AllocationState = {
  failedAllocationIds: [],
  sectionAllocatedTo: undefined
};

export function withAllocationStore<_>() {
  return signalStoreFeature(
    {
      state: type<BaseDependencyState>(),
      methods: type<BaseDependencyMethods>()
    },
    withState<AllocationState>(initialState),
    withMethods(
      (
        store,
        actions = inject(Actions),
        listingService = inject(ListingService),
        schedulingService = inject(SchedulingService),
        allocateHearingFactory = inject(AllocateHearingFactory)
      ) => ({
        allocate: rxMethod<{ payload: BulkAllocatePayload; onSuccess: OnSuccessCallback }>(
          pipe(
            switchMap(({ payload, onSuccess }) =>
              listingService.bulkUpdateHearings(payload.hearings).pipe(
                tapResponse({
                  next: ({ failedHearingIds }) => {
                    patchState(store, { failedAllocationIds: failedHearingIds });
                    onSuccess({
                      processedHearings: payload.hearings,
                      failedAllocationIds: failedHearingIds
                    });
                  },
                  error: (err: HttpErrorResponse) => store.handleError(err)
                })
              )
            )
          )
        ),

        unallocate: rxMethod<{
          hearings: Hearing[];
          jurisdiction: JurisdictionType;
          ouCode: string;
          onSuccess: OnSuccessCallback;
        }>(
          pipe(
            switchMap(({ hearings, jurisdiction, ouCode, onSuccess }) => {
              if (jurisdiction !== 'CROWN') {
                const payloads = hearings.map(h => allocateHearingFactory.unallocateHearing(h));
                return listingService.bulkUpdateHearings(payloads).pipe(
                  tapResponse({
                    next: ({ failedHearingIds }) => {
                      patchState(store, { failedAllocationIds: failedHearingIds });
                      onSuccess({
                        processedHearings: payloads,
                        failedAllocationIds: failedHearingIds
                      });
                    },
                    error: (err: HttpErrorResponse) => store.handleError(err)
                  })
                );
              }

              const groups: Record<string, Hearing[]> = groupBy(hearings, h => h.startDate);

              const slotFetches$ = Object.entries(groups).map(([date, groupHearings]) => {
                const maxDuration = Math.max(...groupHearings.map(h => h.estimatedMinutes ?? 360));
                const params: SearchHearingSlotsParams = buildHearingScheduleParams({
                  sessionStartDate: date,
                  ouCode,
                  jurisdiction: 'CROWN' as Jurisdiction,
                  status: CrownSessionStatus.DRAFT,
                  availableDurationMins: maxDuration
                });
                return schedulingService
                  .searchHearingSlots(params)
                  .pipe(map(({ hearingSlots }) => ({ date, groupHearings, slots: hearingSlots })));
              });

              return forkJoin(slotFetches$).pipe(
                switchMap(results => {
                  const noScheduleIds: string[] = [];
                  const hasSchedulePayloads: HearingAllocationPayload[] = [];

                  for (const { date, groupHearings, slots } of results) {
                    const matchingSlot = slots.find(s => s.sessionDate === date);
                    if (!matchingSlot) {
                      noScheduleIds.push(...groupHearings.map(h => h.id));
                    } else {
                      hasSchedulePayloads.push(
                        ...groupHearings.map(h =>
                          allocateHearingFactory.unallocateHearing(h, matchingSlot.courtScheduleId)
                        )
                      );
                    }
                  }

                  if (hasSchedulePayloads.length === 0) {
                    patchState(store, { failedAllocationIds: noScheduleIds });
                    onSuccess({ processedHearings: [], failedAllocationIds: noScheduleIds });
                    return EMPTY;
                  }

                  return listingService.bulkUpdateHearings(hasSchedulePayloads).pipe(
                    map(({ failedHearingIds }) => ({
                      failedHearingIds,
                      noScheduleIds,
                      hasSchedulePayloads
                    }))
                  );
                }),
                tapResponse({
                  next: ({ failedHearingIds, noScheduleIds, hasSchedulePayloads }) => {
                    const merged = [...noScheduleIds, ...failedHearingIds];
                    patchState(store, { failedAllocationIds: merged });
                    onSuccess({
                      processedHearings: hasSchedulePayloads,
                      failedAllocationIds: merged
                    });
                  },
                  error: (err: HttpErrorResponse) => store.handleError(err)
                })
              );
            })
          )
        ),

        awaitAllocationResult: rxMethod<{ courtRoomId: string; date: string }>(
          pipe(
            switchMap(({ courtRoomId, date }) =>
              actions.pipe(
                ofType(CourtCalendarActions.getAllocatedHearingsForWidgetSuccess),
                take(1),
                switchMap(() => {
                  const failedIds = store.failedAllocationIds();
                  const allSelected = store.selectedHearings() ?? [];
                  const allocated = allSelected.filter(h => !failedIds.includes(h.hearingId));
                  patchState(store, {
                    sectionAllocatedTo: {
                      courtRoomId,
                      date,
                      numOfHearingsAllocated: allocated.length,
                      totalHearingsAttempted: allSelected.length
                    },
                    positionedHearingsState: {
                      positionedHearings: allocated.map(h => ({
                        hearingId: h.hearingId,
                        hearingDate: date
                      })),
                      showAlert: false
                    },
                    selectedHearings: []
                  });
                  return EMPTY;
                })
              )
            )
          )
        ),

        clearAllocationResult: () => {
          patchState(store, { sectionAllocatedTo: undefined });
        }
      })
    )
  );
}
