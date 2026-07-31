import { switchMap, map, take, tap, withLatestFrom, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  getUnallocatedHearingById,
  getAllocatedHearings,
  getUnallocatedHearings
} from '../selectors';
import { AppState } from '../reducers';
import { ListingService } from '../services';
import {
  ListUnallocatedHearingsSuccessAction,
  SearchAllocatedHearingsSuccessAction
} from '../actions';
import { UnallocatedHearings } from '../model/hearing';

@Injectable()
export class UnallocatedHearingExistsGuard {
  constructor(
    private store: Store<AppState>,
    private listingService: ListingService,
    private router: Router
  ) {}

  hasHearingInApi(id: string): Observable<boolean> {
    return this.listingService.fetchHearingById(id).pipe(
      withLatestFrom(this.store),
      tap(([hearing, state]) => {
        if (hearing) {
          if (hearing.allocated) {
            const hearings = [...getAllocatedHearings(state), hearing];
            this.store.dispatch(new SearchAllocatedHearingsSuccessAction(hearings));
          } else {
            const hearings = [...getUnallocatedHearings(state), hearing];
            const unallocatedHearings = {
              hearings,
              pagination: {
                currentPage: 1,
                totalNumber: hearings.length
              }
            } as UnallocatedHearings;

            this.store.dispatch(new ListUnallocatedHearingsSuccessAction(unallocatedHearings));
          }
        }
      }),
      map(([hearing]) => !!hearing)
    );
  }

  hasHearingInStore(id: string): Observable<boolean> {
    return this.store.select(getUnallocatedHearingById(id)).pipe(
      map((hearing) => !!hearing),
      take(1)
    );
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasHearingInStore(route.params.id).pipe(
      switchMap((inStore) => (inStore ? of(true) : this.hasHearingInApi(route.params.id))),
      catchError(() => of(false)),
      tap((canActivate) => {
        if (!canActivate) {
          this.router.navigate(['/technical-error']);
        }
      })
    );
  }
}
