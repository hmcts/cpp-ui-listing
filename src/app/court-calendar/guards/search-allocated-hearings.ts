import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CourtCalendarFeatureState } from '../state';
import { getCourtCalendarFilters } from '../state/selectors/court-calendar.selectors';
import { searchCourtCalendar } from '../state/actions/court-calendar.actions';

export const SearchAllocatedHearingsGuard: CanActivateFn = () => {
  const store = inject(Store<CourtCalendarFeatureState>);
  const router = inject(Router);

  return store.pipe(
    select(getCourtCalendarFilters),
    take(1),
    switchMap((filterOptions) => {
      if (filterOptions?.startDate) {
        store.dispatch(searchCourtCalendar({ filterOptions }));
      }
      return of(true);
    }),
    catchError(() => {
      router.navigate(['/technical-error']);
      return of(false);
    })
  );
};
