import { fromEvent as observableFromEvent, merge as observableMerge } from 'rxjs';
import { startWith, distinctUntilChanged, mapTo } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';
import { NetworkConnectivityAction } from '../../actions';

@Injectable()
export class ConnectionService {
  constructor(private store: Store<AppState>) {}

  serviceFailed(): void {
    this.setHref('/listing/technical-error');
  }

  pageNotFound(): void {
    this.setHref('/listing/page-not-found');
  }

  unauthorizedAccess(): void {
    this.setHref('/listing/unauthorised-access');
  }

  setHref(url: string): void {
    window.location.href = url;
  }

  startConnectivityMonitor(): void {
    observableMerge(
      observableFromEvent(window, 'online').pipe(mapTo(true)),
      observableFromEvent(window, 'offline').pipe(mapTo(false))
    )
      .pipe(startWith(navigator.onLine), distinctUntilChanged())
      .subscribe((online) => this.store.dispatch(new NetworkConnectivityAction(online)));
  }
}
