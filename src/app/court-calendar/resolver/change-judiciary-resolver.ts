import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { map, switchMap, take, catchError } from 'rxjs/operators';
import { ApiError, AppState, ListingService, SelectedFilterOptions } from '../../core';
import { getCourtCalendarFilters } from '../state';

export const changeJudiciaryResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot
): Observable<any> => {
  const store = inject(Store<AppState>);
  const listingService = inject(ListingService);
  const {
    judiciaryIds: judiciaryIdsParam,
    courtRoomId,
    searchDate,
    courtCentreId
  } = route.queryParams;
  const judiciaryIds = judiciaryIdsParam && judiciaryIdsParam.split(',');
  return store.pipe(
    select(getCourtCalendarFilters),
    take(1),
    switchMap(({ courtCentre, pageNumber, ...filterOptions }) => {
      const options = {
        ...filterOptions,
        courtCentreId: courtCentreId,
        courtRoomId,
        startDate: searchDate,
        endDate: searchDate,
        pageSize: null,
        useMaxPageSize: true,
        allocated: true
      } as SelectedFilterOptions;
      return listingService.searchCourtCalendarHearings(options).pipe(
        map(({ hearings }) => {
          const hearingsWithJudiciary = hearings.filter(
            ({ judiciary }) =>
              judiciary.length &&
              judiciary?.every((judiciary) => judiciaryIds.includes(judiciary?.judicialId))
          );
          // if no judiciary means we are adding judiciary 1st time to hearings for selected filters
          const nonJudiciaryHearings = hearings.filter(({ judiciary }) => !judiciary.length);
          const selectedHearings = judiciaryIds.length
            ? hearingsWithJudiciary
            : nonJudiciaryHearings;

          return { hearings: selectedHearings, judiciaryIds };
        }),
        catchError((error: HttpErrorResponse) => of(new ApiError({ error })))
      );
    })
  );
};
