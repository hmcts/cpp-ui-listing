import { signalStoreFeature, withMethods } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, AppState } from '../../core';

export function withErrorHandlerAdapter() {
  return signalStoreFeature(
    withMethods((_, globalStore = inject(Store<AppState>)) => ({
      handleError: (error: HttpErrorResponse): void => {
        globalStore.dispatch(new ApiError(error));
      }
    }))
  );
}
