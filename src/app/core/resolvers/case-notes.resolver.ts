import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AppState,
  getCaseNotesForHearing,
  getUnAllocatedCaseIds,
  ListingService,
  setCaseNotes
} from '../../core';
import { select, Store } from '@ngrx/store';
import { mapTo, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class CaseNotesResolver {
  constructor(
    private store: Store<AppState>,
    private readonly listingService: ListingService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const hearingId = route.params['id'];
    return this.store
      .pipe(
        select(getCaseNotesForHearing, hearingId),
        withLatestFrom(this.store.select(getUnAllocatedCaseIds, hearingId))
      )
      .pipe(
        take(1),
        switchMap(([caseNotes, ids]) => {
          if (caseNotes) {
            return of(true);
          }

          if (ids.length === 0) {
            return of(true);
          }

          return this.listingService.getCaseNotesForCases(ids).pipe(
            tap((caseNotes) =>
              this.store.dispatch(setCaseNotes({ caseNotes: { [hearingId]: caseNotes } }))
            ),
            mapTo(true)
          );
        })
      );
  }
}
