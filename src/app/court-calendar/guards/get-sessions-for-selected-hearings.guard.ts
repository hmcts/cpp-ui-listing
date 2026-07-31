import { inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '../../core';
import { getSelectedHearing } from '../state/selectors/court-calendar.selectors';

import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { ERROR_ROUTE_PATHS } from '@cpp/application';
import { loadHearingSlotsSuccess, SearchHearingSlotsParams } from '@cpp/scheduling';
import { getOrganisationUnits } from '@cpp/reference-data';
import { SchedulingService } from '@cpp/scheduling';

export const getSessionsForSeelectedHearingGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean> => {
  const store = inject(Store<AppState>);
  const scheduleService = inject(SchedulingService);
  const router = inject(Router);

  return store.pipe(
    select(getSelectedHearing),
    withLatestFrom(store.pipe(select(getOrganisationUnits))),
    take(1),
    switchMap(([selectedHearing, courtCentres]) => {
      if (selectedHearing.jurisdictionType === 'CROWN') {
        return of(true);
      }
      const courtCentre = courtCentres.find(({ id }) => selectedHearing.courtCentreId === id);
      const { jurisdictionType, hearingDayCount, hearingDays, startDate, endDate } =
        selectedHearing;
      const isMultiday = !!hearingDayCount ? hearingDayCount > 1 : hearingDays.length > 1;
      const slotsParams: SearchHearingSlotsParams & { isMultiday?: boolean } = {
        sessionStartDate: startDate,
        sessionEndDate: endDate,
        panel: 'ADULT,YOUTH',
        ouCode: courtCentre.oucode,
        pageSize: 500,
        pageNumber: 1,
        showOverbookedSlots: true,
        jurisdiction: jurisdictionType,
        isMultiday
      };
      return scheduleService.searchHearingSlots(slotsParams).pipe(
        tap({
          next: ({ hearingSlots, totalResults }) => {
            store.dispatch(
              loadHearingSlotsSuccess({ hearingSlots, totalResults, params: slotsParams })
            );
          },
          error: () => {
            router.navigate([`/${ERROR_ROUTE_PATHS.technicalError}`]);
          }
        }),
        map(() => true),
        take(1),
        catchError(() => of(false))
      );
    })
  );
};
