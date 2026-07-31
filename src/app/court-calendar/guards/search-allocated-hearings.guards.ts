import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CourtCalendarFeatureState, CourtCalendarFilters } from '../state';
import { getCourtCalendarFilters } from '../state/selectors/court-calendar.selectors';
import {
  getAllocatedHearingsForWidget,
  searchCourtCalendar
} from '../state/actions/court-calendar.actions';
import { CPPDate } from '../../core/util';

export const searchAllocatedHearingsByFilterGuard: CanActivateFn = () => {
  const store = inject(Store<CourtCalendarFeatureState>);
  const router = inject(Router);
  return store.pipe(
    select(getCourtCalendarFilters),
    take(1),
    switchMap((filters = {} as CourtCalendarFilters) => {
      const { useMaxPageSize, ...filterOptions } = filters;
      if (filterOptions?.startDate) {
        store.dispatch(
          searchCourtCalendar({
            filterOptions: { ...filterOptions, pageNumber: 1 }
          })
        );
      }
      return of(true);
    }),
    catchError(() => {
      router.navigate(['/technical-error']);
      return of(false);
    })
  );
};

// This is quite similar to the guard above, however we do not want to update the global filter
// with its filter options , we want to update the widget filter only as it is designed
// to be standalone - However it needs data from the global filter options
export const searchAllocatedWidgetHearingsGuard: CanActivateFn = () => {
  const store = inject(Store<CourtCalendarFeatureState>);
  const router = inject(Router);
  const cppDate = inject(CPPDate);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  return store.pipe(
    select(getCourtCalendarFilters),
    take(1),
    switchMap((filters) => {
      const startDateObj = new Date(filters.startDate);
      startDateObj.setHours(0, 0, 0, 0);
      // If the startdate for the unallocated hearings are in the past , we ensure the user allocates only to the current day and the future.
      const startDate =
        !cppDate.isSame(currentDate, startDateObj) && cppDate.isBefore(startDateObj, currentDate)
          ? cppDate.format(currentDate)
          : filters.startDate;
      store.dispatch(getAllocatedHearingsForWidget({ filterOptions: { ...filters, startDate } }));
      return of(true);
    }),
    catchError(() => {
      router.navigate(['/technical-error']);
      return of(false);
    })
  );
};
