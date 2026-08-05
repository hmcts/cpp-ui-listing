import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganisationUnit } from '@cpp/reference-data';
import { tapResponse } from '@ngrx/operators';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { Hearing, ListingService, mapOrganisationUnitToCourtCentres } from '../../../core';
import { DateRange } from '../../../shared/components/date-range/date-range';
import { AllocateHearingFactory } from '../../utils/allocate-hearing.factory';

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
    withMethods(
      (
        store,
        listingService = inject(ListingService),
        allocateHearingFactory = inject(AllocateHearingFactory)
      ) => ({
        changeHearingEndDate: rxMethod<{
          hearing: Hearing;
          newEndDate: string;
          courtCentre: OrganisationUnit;
          onSuccess: OnEndDateChangedCallback;
        }>(
          pipe(
            switchMap(({ hearing, newEndDate, courtCentre, onSuccess }) => {
              const previousEndDate = hearing.endDate;
              const updatedHearing = allocateHearingFactory.updateAllocatedHearing(
                hearing,
                allocateHearingFactory.hearingToUpdateValues(hearing, {
                  dateRange: new DateRange(hearing.startDate, newEndDate)
                }),
                mapOrganisationUnitToCourtCentres(courtCentre)
              );
              return listingService.updateAllocatedHearing(updatedHearing).pipe(
                tapResponse({
                  next: () => onSuccess({ previousEndDate, newEndDate }),
                  error: (err: HttpErrorResponse) => store.handleError(err)
                })
              );
            })
          )
        )
      })
    )
  );
}
