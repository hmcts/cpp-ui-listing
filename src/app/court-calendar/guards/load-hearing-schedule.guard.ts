import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { combineLatest, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import {
  CrownSessionStatus,
  SchedulingService,
  SearchHearingSlotsParams,
  loadHearingSlotsSuccess
} from '@cpp/scheduling';
import { CPPDate } from '../../core/util';
import { ApiError } from '../../core/actions/api';
import { CourtCalendarFeatureState, getCourtCalendarFilters, getSelectedCourtFor } from '../state';

const resolveStartDate = (startDate: string | undefined, today: Date, cppDate: CPPDate): string => {
  if (!startDate) {
    return cppDate.format(today);
  }
  const startDateObj = new Date(startDate);
  startDateObj.setHours(0, 0, 0, 0);
  return !cppDate.isSame(today, startDateObj) && cppDate.isBefore(startDateObj, today)
    ? cppDate.format(today)
    : startDate;
};

export const loadHearingScheduleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store<CourtCalendarFeatureState>);
  const router = inject(Router);
  const schedulingService = inject(SchedulingService);
  const cppDate = inject(CPPDate);
  const { courtCentreId } = route.params;
  const queryParams = route.queryParams;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return combineLatest([
    store.pipe(select(getCourtCalendarFilters), take(1)),
    store.pipe(select(getSelectedCourtFor(courtCentreId)), take(1))
  ]).pipe(
    switchMap(([filters, selectedCourt]) => {
      const courtCentre = filters?.courtCentre ?? selectedCourt;

      if (!courtCentre) {
        router.navigate(['/court-calendar']);
        return of(false);
      }

      const startDate = resolveStartDate(
        filters?.startDate ?? queryParams.startDate,
        today,
        cppDate
      );
      const courtSession = filters?.courtSession ?? queryParams.courtSession;
      const jurisdiction = filters?.courtType ?? queryParams.jurisdiction;

      const slotsParams: SearchHearingSlotsParams = {
        sessionStartDate: startDate,
        sessionEndDate: startDate,
        panel: 'ADULT,YOUTH',
        ouCode: courtCentre.oucode,
        pageSize: 500,
        pageNumber: 1,
        businessType: filters?.businessType ?? queryParams.businessType ?? undefined,
        courtSession: courtSession && courtSession !== 'Any' ? courtSession : undefined,
        showOverbookedSlots: true,
        jurisdiction,
        status: jurisdiction === 'CROWN' ? CrownSessionStatus.FINAL : undefined
      };

      return schedulingService.searchHearingSlots(slotsParams).pipe(
        tap(({ hearingSlots, totalResults }) => {
          store.dispatch(
            loadHearingSlotsSuccess({ hearingSlots, totalResults, params: slotsParams })
          );
        }),
        map(() => true)
      );
    }),
    catchError((error: HttpErrorResponse) => {
      store.dispatch(new ApiError(error));
      return of(false);
    })
  );
};
