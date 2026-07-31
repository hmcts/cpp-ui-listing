import { switchMap, tap, catchError, take, map, mapTo } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { getJudiciaries } from '../selectors';
import { AppState } from '../reducers';
import { LoadJudiciariesSuccessAction } from '../actions/reference-data';
import { ReferenceDataService } from '@cpp/reference-data';

@Injectable()
export class JudiciariesLoadGuard {
  constructor(
    private store: Store<AppState>,
    private refDataService: ReferenceDataService,
    private router: Router
  ) {}

  hasJudiciariesInStore(): Observable<boolean> {
    return this.store.pipe(
      select(getJudiciaries),
      switchMap((hasInStore) => (hasInStore ? of(true) : this.hasJudiciariesInApi())),
      take(1)
    );
  }

  hasJudiciariesInApi(): Observable<boolean> {
    return this.refDataService
      .fetchJudicialMembers({
        judiciaryGroup: 'Deputy District Judge'
      })
      .pipe(
        tap((judicialMembers) =>
          this.store.dispatch(new LoadJudiciariesSuccessAction(judicialMembers))
        ),
        mapTo(true)
      );
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasJudiciariesInStore().pipe(
      map(Boolean),
      catchError(() => {
        this.router.navigate(['/technical-error']);
        return of(false);
      })
    );
  }
}
