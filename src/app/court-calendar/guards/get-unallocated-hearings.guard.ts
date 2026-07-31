import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { CPPDate } from '../../core/util';
import {
  CourtCalendarFeatureState,
  getCourtCalendarFilters,
  getHearingTypeFor,
  getSelectedCourtFor
} from '../state';
import { getUnallocatedHearings } from '../state/actions/court-calendar.actions';

export const getUnallocatedHearingsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<CourtCalendarFeatureState>);
  const router = inject(Router);
  const cppDate = inject(CPPDate);
  const { courtCentreId } = route.params;
  const queryParams = route.queryParams;

  if (!courtCentreId) {
    router.navigate(['/court-calendar']);
    return of(false);
  }

  return combineLatest([
    store.pipe(select(getCourtCalendarFilters), take(1)),
    store.pipe(select(getSelectedCourtFor(courtCentreId)), take(1)),
    store.pipe(select(getHearingTypeFor(queryParams.hearingType)), take(1))
  ]).pipe(
    switchMap(([filters, selectedCourt, hearingTypeFromParams]) => {
      const courtCentre = filters?.courtCentre ?? selectedCourt;

      if (!courtCentre) {
        router.navigate(['/court-calendar']);
        return of(false);
      }

      const startDate = filters?.startDate ?? queryParams.startDate ?? cppDate.format(new Date());

      store.dispatch(
        getUnallocatedHearings({
          filterOptions: {
            courtCentre,
            startDate,
            endDate: filters?.endDate ?? queryParams.endDate ?? startDate,
            courtType: filters?.courtType ?? queryParams.jurisdiction,
            courtSession: filters?.courtSession ?? queryParams.courtSession,
            businessType: filters?.businessType ?? queryParams.businessType,
            courtRoomId: filters?.courtRoomId ?? queryParams.courtRoomId,
            hearingType: filters?.hearingType ?? hearingTypeFromParams,
            pageNumber: 1,
            pageSize: 40
          }
        })
      );

      return of(true);
    }),
    catchError(() => of(false))
  );
};
