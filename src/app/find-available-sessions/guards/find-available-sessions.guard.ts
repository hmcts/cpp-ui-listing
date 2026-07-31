import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { AppState } from '../../core';
import {
  SchedulingService,
  SearchHearingSlotsParams,
  loadHearingSlotsSuccess,
  resetHearingSlots
} from '@cpp/scheduling';

export interface FindAvailableSessionsQueryParams {
  mf: string;
}

export const FindAvailableSessionsGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<AppState>);
  const scheduling = inject(SchedulingService);

  const searchWithParams = ({ ...params }: SearchHearingSlotsParams) => {
    let searchParams = {
      ...params,
      pageSize: 10
    };

    return scheduling.searchHearingSlots(searchParams).pipe(
      tap(
        (result) => {
          store.dispatch(
            loadHearingSlotsSuccess({
              params: searchParams,
              hearingSlots: result.hearingSlots,
              totalResults: result.totalResults
            })
          );
        },
        () => store.dispatch(resetHearingSlots())
      ),
      mapTo(true)
    );
  };

  const queryParams = route.queryParams as FindAvailableSessionsQueryParams;
  const { mf } = queryParams;

  return store.pipe(
    take(1),
    switchMap(() => {
      if (mf) {
        return searchWithParams(JSON.parse(mf));
      }
      return of(true).pipe(
        tap(() => {
          store.dispatch(resetHearingSlots());
        })
      );
    }),
    catchError(() => of(createUrlTreeFromSnapshot(route, ['/technical-error'])))
  );
};
