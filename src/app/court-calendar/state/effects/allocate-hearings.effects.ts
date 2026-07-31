import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/actions/api';
import { CourtCalendarActions } from '../actions';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ListingService, PaginatedHearingResponse, SelectedFilterOptions } from '../../../core';
import { mapResponseToPaginatedHearingMap } from '../../utils/court-calendar-hearings-helper';
import { AllocateHearingCase, PaginatedHearingMap } from '../../model';
import {
  CrownSessionStatus,
  loadHearingSlotsSuccess,
  SchedulingService,
  SearchHearingSlotsParams
} from '@cpp/scheduling';

export const getAllocatedHearingsForWidgetEffect = createEffect(
  (actions$ = inject(Actions), listingService = inject(ListingService)) =>
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
          }
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

          return listingService.searchCourtCalendarHearings(payload).pipe(
            map(({ notes: _, ...restResponse }) =>
              mapResponseToPaginatedHearingMap(
                restResponse,
                restParams.startDate,
                null,
                1,
                courtCentre.courtrooms
              )
            ),
            map(hearingsPayload =>
              CourtCalendarActions.getAllocatedHearingsForWidgetSuccess({
                payload: hearingsPayload
              })
            ),
            catchError((error: HttpErrorResponse) => of(new ApiError(error)))
          );
        }
      )
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
            map(payload => CourtCalendarActions.getUnallocatedHearingsSuccess({ payload })),
            catchError((error: HttpErrorResponse) => of(new ApiError(error)))
          );
        }
      )
    ),
  { functional: true }
);

export const reloadWidgetSchedulesEffect = createEffect(
  (actions$ = inject(Actions), schedulingService = inject(SchedulingService)) =>
    actions$.pipe(
      ofType(CourtCalendarActions.reloadWidgetSchedules),
      switchMap(
        ({ filterOptions: { startDate, courtCentre, businessType, courtSession }, courtType }) => {
          const params: SearchHearingSlotsParams = {
            sessionStartDate: startDate,
            sessionEndDate: startDate,
            panel: 'ADULT,YOUTH',
            ouCode: courtCentre.oucode,
            pageSize: 500,
            pageNumber: 1,
            businessType: businessType ?? undefined,
            courtSession: courtSession && courtSession !== 'Any' ? courtSession : undefined,
            showOverbookedSlots: true,
            jurisdiction: courtType,
            status: courtType === 'CROWN' ? CrownSessionStatus.FINAL : undefined
          };
          return schedulingService.searchHearingSlots(params).pipe(
            map(({ hearingSlots, totalResults }) =>
              loadHearingSlotsSuccess({ hearingSlots, totalResults, params })
            ),
            catchError((error: HttpErrorResponse) => of(new ApiError(error)))
          );
        }
      )
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
            catchError(err => of(new ApiError(err)))
          );
      })
    ),
  { functional: true }
);
