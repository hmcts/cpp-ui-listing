import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/actions/api';
import { CourtCalendarActions } from '../actions';
import { forkJoin, of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  ListingService,
  PaginatedHearingResponse,
  AppState,
  SelectedFilterOptions
} from '../../../core';
import {
  mapHearingRowVmToSequencedHearings,
  mapResponseToPaginatedHearingMap
} from '../../utils/court-calendar-hearings-helper';
import { Action, select, Store } from '@ngrx/store';
import {
  getCourtCalendarFilters,
  getAllocateWidgetFilter,
  getFailedAllocationIds,
  getAllocationType,
  getCourtCalendarFeature
} from '../selectors';
import {
  AllocateHearingCase,
  AllocationType,
  CourtCalendarFeature,
  PaginatedHearingMap
} from '../../model';
import { BaseHearingRowDataVM } from '../../model/hearing-table-renderer.vm';
import { SchedulingService } from '@cpp/scheduling';
import { HearingSlot, loadHearingSlotsSuccess, SearchHearingSlotsParams } from '@cpp/scheduling';

export const getAllocatedHearingsForWidgetEffect = createEffect(
  (
    actions$ = inject(Actions),
    listingService = inject(ListingService),
    schedulingService = inject(SchedulingService)
  ) =>
    actions$.pipe(
      ofType(CourtCalendarActions.getAllocatedHearingsForWidget),
      switchMap(
        ({
          filterOptions: {
            courtSession,
            courtCentre,
            hearingType,
            courtType,
            pageNumber,
            ...restParams
          },
          onSectionAllocate,
          onSequenceOnly: onSequenceFinished
        }) => {
          const payload: SelectedFilterOptions = {
            ...restParams,
            courtRoomId: undefined,
            jurisdictionType: courtType,
            pageSize: undefined,
            endDate: restParams.startDate,
            useMaxPageSize: true,
            courtCentreId: courtCentre.id,
            courtSession,
            hearingTypeId: hearingType?.id,
            ouCode:
              !!restParams.businessType || (courtSession && courtSession !== 'Any')
                ? courtCentre.oucode
                : undefined,
            allocated: true
          };
          const slotsParams: SearchHearingSlotsParams = {
            sessionStartDate: restParams.startDate,
            sessionEndDate: restParams.startDate,
            panel: 'ADULT,YOUTH',
            ouCode: courtCentre.oucode,
            pageSize: 4000,
            pageNumber: 1,
            businessType: restParams?.businessType ?? undefined,
            courtSession: courtSession && courtSession !== 'Any' ? courtSession : undefined,
            showOverbookedSlots: true
          };

          const requests$ = forkJoin(
            courtType === 'MAGISTRATES'
              ? [
                  listingService.searchCourtCalendarHearings(payload),
                  schedulingService.searchHearingSlots(slotsParams)
                ]
              : [
                  listingService.searchCourtCalendarHearings(payload),
                  of({ hearingSlots: null as HearingSlot[], totalResults: 0 })
                ]
          );

          return requests$.pipe(
            map(
              ([{ notes: _, ...restResponse }, { hearingSlots, totalResults }]) =>
                [
                  mapResponseToPaginatedHearingMap(
                    restResponse,
                    restParams.startDate,
                    null,
                    1,
                    courtCentre.courtrooms
                  ),
                  { hearingSlots, totalResults }
                ] as [PaginatedHearingMap, { hearingSlots: HearingSlot[]; totalResults: number }]
            ),
            switchMap(([payload, { hearingSlots, totalResults }]) =>
              !!hearingSlots
                ? [
                    loadHearingSlotsSuccess({ params: slotsParams, hearingSlots, totalResults }),
                    CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
                      payload,
                      onSectionAllocate,
                      onSequenceOnly: onSequenceFinished
                    })
                  ]
                : [
                    CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
                      payload,
                      onSectionAllocate,
                      onSequenceOnly: onSequenceFinished
                    })
                  ]
            ),
            catchError((error: HttpErrorResponse) => of(new ApiError(error)))
          );
        }
      )
    ),
  { functional: true }
);

export const getAllocatedHearingsForWidgetSuccessEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store<AppState>)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.getAllocatedHearingsForWidgetSuccess),
      withLatestFrom(store.pipe(select(getFailedAllocationIds))),
      filter(([{ onSequenceOnly, onSectionAllocate }]) => onSequenceOnly || onSectionAllocate),
      map(([{ onSectionAllocate }, failedAllocationIds]) => {
        if (onSectionAllocate) {
          return CourtCalendarActions.triggerComponentOnSectionAllocated({
            failedHearingIds: failedAllocationIds
          });
        }
        return CourtCalendarActions.triggerComponentOnSequenceOnly();
      })
    ),
  { functional: true }
);

export const getUnallocatedHearingsEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.getUnallocatedHearings),
      switchMap(
        ({
          filterOptions: {
            courtCentre,
            courtType,
            courtSession = 'Any',
            hearingType,
            startDate,
            businessType,
            endDate,
            ...restParams
          }
        }) => {
          const payload: SelectedFilterOptions = {
            ...restParams,
            courtRoomId: undefined,
            weekCommencingStartDate: startDate,
            weekCommencingEndDate: endDate || startDate,
            jurisdictionType: courtType,
            courtCentreId: courtCentre.id,
            hearingTypeId: hearingType?.id,
            ouCode: businessType || courtSession !== 'Any' ? courtCentre.oucode : undefined,
            allocated: false
          };

          return listingService.searchCourtCalendarHearings(payload).pipe(
            map(
              ({ hearings, pageCount, results }: PaginatedHearingResponse) =>
                ({
                  paginatedHearings: {
                    hearings: hearings.filter(({ hearingDays }) => hearingDays?.length > 0),
                    pagination: {
                      totalNumber: results,
                      currentPage: restParams.pageNumber,
                      pageCount
                    }
                  }
                }) as PaginatedHearingMap
            ),
            map((payload) => CourtCalendarActions.getUnallocatedHearingsSuccess({ payload })),
            catchError((error: HttpErrorResponse) => of(new ApiError(error)))
          );
        }
      )
    ),

  { functional: true }
);

export const bulkUpdateHearingsEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.bulkUpdateHearings),
      switchMap(({ payload }) =>
        listingService.bulkUpdateHearings(payload.hearings).pipe(
          map(({ failedHearingIds }) => {
            if (failedHearingIds.length === payload.hearings.length) {
              return CourtCalendarActions.setAlertMessage({
                failureAlert: 'Hearings could not be allocated. Try again.'
              });
            }
            return CourtCalendarActions.bulkUpdateHearingsSuccess({
              payload,
              failedAllocationIds: failedHearingIds
            });
          }),
          catchError((error: HttpErrorResponse) => of(new ApiError(error)))
        )
      )
    ),
  { functional: true }
);

export const bulkUpdateHearingsSuccessEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store<AppState>)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.bulkUpdateHearingsSuccess),
      withLatestFrom(
        store.pipe(select(getCourtCalendarFilters)),
        store.pipe(select(getAllocateWidgetFilter)),
        store.pipe(select(getAllocationType))
      ),
      switchMap(([{ payload }, filterOptions, widgetFilter, allocationType]) => {
        const { insertAfterId, insertBeforeId, hearings, group } = payload;
        if ((insertAfterId || insertBeforeId) && !!group) {
          const hearingsAllocatedIds = hearings.map(({ hearingId }) => hearingId);
          const hearingsAllocatedVm = hearings.map(
            ({ hearingId, startDate }) =>
              ({ id: hearingId, hearingDate: startDate, isMaster: true }) as BaseHearingRowDataVM
          );
          const sequencedHearings = mapHearingRowVmToSequencedHearings(
            [...group.hearings, ...hearingsAllocatedVm],
            hearingsAllocatedIds,
            insertBeforeId,
            insertAfterId
          );
          return [
            CourtCalendarActions.sequenceGroupHearings({
              sequencedHearings,
              onSectionAllocate: true
            })
          ];
        }
        const widgetFilterOptions = { ...filterOptions, ...widgetFilter, endDate: undefined };

        if (allocationType === AllocationType.allocate) {
          return [
            CourtCalendarActions.getUnallocatedHearings({ filterOptions }),
            CourtCalendarActions.getAllocatedHearingsForWidget({
              filterOptions: widgetFilterOptions,
              onSectionAllocate: true
            })
          ];
        }
        return [
          CourtCalendarActions.getAllocatedHearingsForWidget({
            filterOptions: widgetFilterOptions,
            onSectionAllocate: true
          })
        ];
      })
    ),
  { functional: true }
);

export const UnallocateHearingsEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.unallocateHearings),
      switchMap(({ payload }) =>
        listingService.bulkUpdateHearings(payload.hearings).pipe(
          map(({ failedHearingIds }) => {
            if (failedHearingIds.length === payload.hearings.length) {
              return CourtCalendarActions.setAlertMessage({
                failureAlert: 'Hearings could not be unallocated. Try again.'
              });
            }
            return CourtCalendarActions.unallocateHearingsSuccess({
              failedAllocationIds: failedHearingIds
            });
          }),
          catchError((error: HttpErrorResponse) => of(new ApiError(error)))
        )
      )
    ),
  { functional: true }
);

export const UnallocateHearingsSuccessEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store<AppState>)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.unallocateHearingsSuccess),
      withLatestFrom(
        store.pipe(select(getCourtCalendarFilters)),
        store.pipe(select(getAllocateWidgetFilter)),
        store.pipe(select(getAllocationType)),
        store.pipe(select(getCourtCalendarFeature))
      ),
      switchMap(([_, filterOptions, widgetFilter, allocationType, features]) => {
        const actions: Action[] = [];
        if (features === CourtCalendarFeature.calendar) {
          actions.push(
            CourtCalendarActions.searchCourtCalendar({
              filterOptions
            })
          );
        }
        if (features === CourtCalendarFeature.allocateCrown) {
          const widgetFilterOptions = { ...filterOptions, ...widgetFilter, endDate: undefined };
          if (allocationType === AllocationType.allocate) {
            actions.push(
              ...[
                CourtCalendarActions.getUnallocatedHearings({ filterOptions }),
                CourtCalendarActions.getAllocatedHearingsForWidget({
                  filterOptions: widgetFilterOptions,
                  onSectionAllocate: true
                })
              ]
            );
          } else if (allocationType === AllocationType.reallocate) {
            actions.push(
              CourtCalendarActions.getAllocatedHearingsForWidget({
                filterOptions: widgetFilterOptions,
                onSectionAllocate: true
              })
            );
          }
        }
        actions.push(
          CourtCalendarActions.setAlertMessage({
            successAlert: 'Hearing(s) have been successfully unallocated.'
          })
        );
        return actions;
      })
    ),
  { functional: true }
);

export const updateHearingPublicListNoteEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.updateHearingPublicListNote),
      switchMap(({ updatedUnallocatedHearing }) => {
        const { listedCases } = updatedUnallocatedHearing;
        const prosecutionCases: AllocateHearingCase[] =
          !!listedCases && listedCases.length > 0
            ? listingService.extractProsecutionCasesIdsFromHearing(updatedUnallocatedHearing)
            : [];

        return listingService
          .updateUnallocatedHearing(updatedUnallocatedHearing, prosecutionCases)
          .pipe(
            map(() =>
              CourtCalendarActions.updateHearingPublicListNoteSuccess({ updatedUnallocatedHearing })
            ),
            catchError((err) => of(new ApiError(err)))
          );
      })
    ),
  { functional: true }
);
