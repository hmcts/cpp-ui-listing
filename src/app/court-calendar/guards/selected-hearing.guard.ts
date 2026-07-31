import { inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AppState, Hearing, ListingService } from '../../core';
import { getSelectedHearing } from '../state/selectors/court-calendar.selectors';
import { setSelectedHearingData } from '../state/actions/court-calendar.actions';

import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { ERROR_ROUTE_PATHS } from '@cpp/application';
import { CourtCalendarRoutes } from '../court-calendar.routes';
import { dateIsCurrentOrGreaterThan } from '../utils/court-calendar-hearings-helper';

export const selectedHearingGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean> => {
  const store = inject(Store<AppState>);
  const listingService = inject(ListingService);
  const router = inject(Router);
  const hearingId = route.paramMap.get('hearingId');
  const [firstUrlSegment] = route.url;

  const hasSelectedHearingInApi = (hearingId): Observable<boolean> => {
    return listingService.fetchHearingById(hearingId).pipe(
      activateSelectedHearingPathEligibility(),
      tap({
        next: (selectedHearing) => {
          store.dispatch(setSelectedHearingData({ selectedHearing }));
        },
        error: () => {
          router.navigate([`/${ERROR_ROUTE_PATHS.technicalError}`]);
        }
      }),
      map((selectedHearing) => !!selectedHearing),
      take(1)
    );
  };

  const hasSelectedHearingInStore = (): Observable<boolean> => {
    return store.pipe(
      select(getSelectedHearing),
      take(1),
      activateSelectedHearingPathEligibility(),
      map((selectedHearing) => !!selectedHearing)
    );
  };

  const activateSelectedHearingPathEligibility = () => {
    return (source$: Observable<Hearing>) =>
      source$.pipe(
        tap((hearing) => {
          if (hearing?.hearingDays.length > 0) {
            const { startDate, endDate } = hearing;
            if (
              (firstUrlSegment.path === CourtCalendarRoutes.CHANGE_HEARING ||
                firstUrlSegment.path === CourtCalendarRoutes.CHANGE_COURTROOM) &&
              !dateIsCurrentOrGreaterThan(endDate)
            ) {
              router.navigate(['/court-calendar']);
            } else if (
              firstUrlSegment.path === CourtCalendarRoutes.REMOVE_HEARINGS &&
              !dateIsCurrentOrGreaterThan(startDate)
            ) {
              router.navigate(['/court-calendar']);
            }
          }
        })
      );
  };

  return hasSelectedHearingInStore().pipe(
    switchMap((inStore) => (inStore ? of(true) : hasSelectedHearingInApi(hearingId))),
    catchError(() => of(false))
  );
};
