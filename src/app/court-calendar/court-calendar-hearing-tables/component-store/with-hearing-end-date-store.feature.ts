import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HearingType } from '@cpp/reference-data';
import { tapResponse } from '@ngrx/operators';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Store } from '@ngrx/store';
import { pipe, switchMap } from 'rxjs';
import {
  getCourtCentres,
  Hearing,
  HearingWithSelectedCourtCentre,
  ListingService
} from '../../../core';
import { CPPDate } from '../../../core/util';
import { DateRange } from '../../../shared/components/date-range/date-range';
import { ChangeHearingDetailsFormValues } from '../../change-hearing-details/components/change-hearing-details.component';
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
        allocateHearingFactory = inject(AllocateHearingFactory),
        cppDate = inject(CPPDate),
        ngrxStore = inject(Store)
      ) => {
        const courtCentres = ngrxStore.selectSignal(getCourtCentres);
        const buildUpdatedHearing = (
          hearing: Hearing,
          newEndDate: string
        ): HearingWithSelectedCourtCentre => {
          const [{ startTime, durationMinutes, courtScheduleId }] = hearing.hearingDays;
          const isMultiDay = hearing.startDate !== newEndDate;

          return allocateHearingFactory.updateAllocatedHearing(
            hearing,
            {
              hasVideoLink: !!hearing.hasVideoLink,
              sendNotificationToParties: !!hearing.sendNotificationToParties,
              hearingLanguage: hearing.hearingLanguage,
              publicListNote: hearing.publicListNote,
              nonSittingDays: hearing.nonSittingDays,
              nonDefaultDays: hearing.hearingDayCount === 1 ? [] : hearing.nonDefaultDays,
              dateRange: new DateRange(hearing.startDate, newEndDate),
              selectedHearingType: {
                id: hearing.type.id,
                hearingDescription: hearing.type.description
              } as HearingType,
              startTime: cppDate.format(startTime, cppDate.HOURS_MINUTES_24H),
              duration: isMultiDay
                ? cppDate.countWorkingDays(hearing.startDate, newEndDate) * 360
                : durationMinutes,
              courtScheduleId
            } as ChangeHearingDetailsFormValues,
            courtCentres().find(({ id }) => id === hearing.courtCentreId)
          );
        };

        return {
          changeHearingEndDate: rxMethod<{
            hearing: Hearing;
            newEndDate: string;
            onSuccess: OnEndDateChangedCallback;
          }>(
            pipe(
              switchMap(({ hearing, newEndDate, onSuccess }) => {
                const previousEndDate = hearing.endDate;
                return listingService
                  .updateAllocatedHearing(buildUpdatedHearing(hearing, newEndDate))
                  .pipe(
                    tapResponse({
                      next: () => onSuccess({ previousEndDate, newEndDate }),
                      error: (err: HttpErrorResponse) => store.handleError(err)
                    })
                  );
              })
            )
          )
        };
      }
    )
  );
}
