import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ERROR_ROUTE_PATHS } from '@cpp/application';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { CourtCalendarState } from '../model';
import { getHearingsToReallocate } from '../state';

export const reallocateHearingsNavGuard: CanActivateFn = (): Observable<boolean> => {
  const store = inject(Store<CourtCalendarState>);
  const router = inject(Router);
  return store.pipe(
    select(getHearingsToReallocate),
    map((hearings) => hearings?.length > 0),
    take(1),
    tap({
      next: (hasHearingsToReallocaate) => {
        if (!hasHearingsToReallocaate) {
          router.navigate(['/court-calendar']);
        }
      },
      error: () => {
        router.navigate([`/${ERROR_ROUTE_PATHS.technicalError}`]);
      }
    }),
    map((inStore) => (inStore ? true : false)),
    catchError(() => of(false))
  );
};
