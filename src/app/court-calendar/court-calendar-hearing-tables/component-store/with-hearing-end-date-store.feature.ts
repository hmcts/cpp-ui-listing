import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { Hearing, HearingWithSelectedCourtCentre, ListingService } from '../../../core';

export interface ChangeEndDateResult {
  previousEndDate: string;
  newEndDate: string;
}

export type OnEndDateChangedCallback = (result: ChangeEndDateResult) => void;

interface BaseDependencyMethods extends Record<string, Function> {
  handleError: (error: HttpErrorResponse) => void;
}

export function withHearingEndDateStore<_>() {
  return signalStoreFeature(
    {
      methods: type<BaseDependencyMethods>()
    },
    withMethods((store, listingService = inject(ListingService)) => ({
      /**
       * Moves the end date of an already allocated multi-day hearing. The hearing is sent back
       * unchanged apart from its end date - the backend recalculates the hearing days from it.
       */
      changeHearingEndDate: rxMethod<{
        hearing: Hearing;
        newEndDate: string;
        onSuccess: OnEndDateChangedCallback;
      }>(
        pipe(
          switchMap(({ hearing, newEndDate, onSuccess }) => {
            const previousEndDate = hearing.endDate;
            return listingService
              .updateAllocatedHearing({
                ...hearing,
                nonDefaultDays: hearing.nonDefaultDays ?? [],
                endDate: newEndDate
              } as HearingWithSelectedCourtCentre)
              .pipe(
                tapResponse({
                  next: () => onSuccess({ previousEndDate, newEndDate }),
                  error: (err: HttpErrorResponse) => store.handleError(err)
                })
              );
          })
        )
      )
    }))
  );
}
