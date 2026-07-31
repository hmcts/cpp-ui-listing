import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, OperatorFunction } from 'rxjs';
import { HttpQueryOptions, HttpComandOptions, HttpCommandSyncOptions, CppHttp } from '@cpp/core';

import { finalize } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { completedApiRequest, pendingApiRequest } from '../actions';
import { AppState } from '../reducers';

export type HttpBackgroundQueryOptions = HttpQueryOptions & {
  background?: boolean;
};

export type HttpBackgroundCommandSyncOptions = HttpCommandSyncOptions & {
  background?: boolean;
};

export type HttpBackgroundCommandOptions = HttpComandOptions & {
  background?: boolean;
};

export type RequestOptions =
  | HttpBackgroundQueryOptions
  | HttpBackgroundCommandOptions
  | HttpBackgroundCommandSyncOptions;

@Injectable()
export class CPPMonitorHttp extends CppHttp {
  readonly store = inject(Store<AppState>);

  handleRequest(request: RequestOptions) {
    if (!request.background) {
      this.store.dispatch(pendingApiRequest({ request }));
    }
  }

  handleResponse<R extends {}>(request: RequestOptions): OperatorFunction<R, R> {
    return (source$) =>
      source$.pipe(
        finalize(() => {
          if (!request.background) {
            this.store.dispatch(completedApiRequest({ request }));
          }
        })
      );
  }

  // given that we store api requests and state is immutable , including http params and most api calls are done
  // asynchronously , to avoid Angular internal httpparams or headers being made readonly,
  // we must clone these request options to send to store
  getReadOnlyOptionsForStore(options: RequestOptions) {
    return cloneDeep(options);
  }

  query<R>(options: HttpBackgroundQueryOptions): Observable<R> {
    const reqOptionsForStore = this.getReadOnlyOptionsForStore(options);
    this.handleRequest(reqOptionsForStore);
    return super.query<R>(options).pipe(this.handleResponse(reqOptionsForStore));
  }

  command<R>(options: HttpBackgroundCommandOptions): Observable<R> {
    const reqOptionsForStore = this.getReadOnlyOptionsForStore(options);
    this.handleRequest(reqOptionsForStore);
    return super.command(options).pipe(this.handleResponse(reqOptionsForStore));
  }

  commandSync<R extends object>(options: HttpBackgroundCommandSyncOptions): Observable<R> {
    const reqOptionsForStore = this.getReadOnlyOptionsForStore(options);
    this.handleRequest(reqOptionsForStore);
    return super
      .commandSync(options)
      .pipe(this.handleResponse(reqOptionsForStore) as OperatorFunction<{}, R>);
  }
}
