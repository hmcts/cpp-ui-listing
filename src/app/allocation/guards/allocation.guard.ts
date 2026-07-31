import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Params, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import * as _ from 'lodash-es';
import { catchError, filter, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { AppState, getHearingById } from '../../core';
import {
  loadHearingSlotsSuccess,
  resetHearingSlots,
  loadListingNotes,
  SchedulingService,
  SearchHearingSlotsParams
} from '@cpp/scheduling';

export interface MagistratesSchedulingQueryParams extends Params {
  mf: string;
}

@Injectable()
export class AllocationGuard {
  constructor(
    private router: Router,
    private store: Store<AppState>,
    private scheduling: SchedulingService
  ) {}

  searchWithParams({ ...params }: SearchHearingSlotsParams) {
    let searchParams = {
      ...params,
      pageSize: 10
    };

    return this.scheduling.searchHearingSlots(searchParams).pipe(
      tap(
        result => {
          this.store.dispatch(
            loadHearingSlotsSuccess({
              params: searchParams,
              hearingSlots: result.hearingSlots,
              totalResults: result.totalResults
            })
          );
          this.store.dispatch(loadListingNotes({ notes: result.notes }));
        },
        () => this.store.dispatch(resetHearingSlots())
      ),
      mapTo(true)
    );
  }

  canActivate({ params, queryParams }: ActivatedRouteSnapshot) {
    return this.store.pipe(
      select(getHearingById(params.id)),
      filter(hearing => !!hearing),
      take(1),
      switchMap(hearing => {
        const { mf } = queryParams as MagistratesSchedulingQueryParams;
        if (mf) {
          return this.searchWithParams(JSON.parse(mf));
        }
        return of(true).pipe(
          tap(() => {
            this.store.dispatch(resetHearingSlots());
          })
        );
      }),
      catchError(() => of(false)),
      tap(canActivate => {
        if (!canActivate) {
          this.router.navigate(['/technical-error']);
        }
      })
    );
  }
}
