import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, catchError, tap, take, withLatestFrom } from 'rxjs/operators';
import { getQueryParams } from '../../core';
import { CPPDate } from '../../core/util';
import {
  CourtCalendarFeatureState,
  getJurisdictionTypeFromFeature,
  getCourtCalendarFilters,
  getSelectedCourtFor
} from '../state';
import { getUnallocatedHearings } from '../state/actions/court-calendar.actions';

export const getUnallocatedHearingsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<CourtCalendarFeatureState>);
  const router = inject(Router);
  const cppDate = inject(CPPDate);
  const { courtCentreId } = route.params;
  return store.pipe(
    select(getCourtCalendarFilters),
    take(1),
    tap(() => {
      if (!courtCentreId) {
        router.navigate(['/court-calendar']);
      }
    }),
    withLatestFrom(
      store.pipe(select(getSelectedCourtFor(courtCentreId))),
      store.pipe(select(getQueryParams)),
      store.pipe(select(getJurisdictionTypeFromFeature))
    ),
    switchMap(
      ([{ startDate, endDate, ...restOptions }, courtCentre, queryParams, jurisdictionType]) => {
        let courtType = restOptions?.courtType || jurisdictionType;
        if (!startDate) {
          startDate = queryParams?.startDate || cppDate.format(new Date());
          endDate = queryParams?.endDate || startDate;
        }

        store.dispatch(
          getUnallocatedHearings({
            filterOptions: {
              ...restOptions,
              startDate,
              endDate,
              courtCentre,
              courtType,
              pageNumber: 1,
              pageSize: 40 // Always reset to 40 on navigation
            }
          })
        );
        return of(true);
      }
    ),
    catchError(() => {
      router.navigate(['/technical-error']);
      return of(false);
    })
  );
};
