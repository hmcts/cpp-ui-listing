import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap, throttleTime, withLatestFrom } from 'rxjs/operators';
import { ApiError } from '../actions';
import * as ApiActions from '../actions/api';
import { ErrorRouteState } from '@cpp/application';
import { select, Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { getCurrentUrl } from '../selectors';

@Injectable()
export class RouterEffects {
  constructor(private actions$: Actions, private router: Router, private store: Store<AppState>) {}

  navigateApiError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ApiActions.API_ERROR),
        throttleTime(1000),
        withLatestFrom(this.store.pipe(select(getCurrentUrl))),
        map(([{ response }, currentUrl]: [ApiError, string]): ErrorRouteState => {
          const state = {
            redirectUrl: `/listing${currentUrl}`
          } as ErrorRouteState;

          switch (response.status) {
            case 0:
              return {
                ...state,
                errorPath: '/timed-out-error'
              };
            case 403:
              return {
                ...state,
                errorPath: '/unauthorised-access'
              };
            case 404:
              return {
                ...state,
                errorPath: '/page-not-found'
              };
            case 401:
              return {
                ...state,
                errorPath: '/signed-out-error'
              };
            default:
              return {
                ...state,
                errorPath: '/technical-error'
              };
          }
        }),
        tap((routeState) => this.router.navigate([routeState.errorPath], { state: routeState }))
      ),
    { dispatch: false }
  );
}
