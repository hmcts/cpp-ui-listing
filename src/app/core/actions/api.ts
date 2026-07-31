import { Action, createAction, props } from '@ngrx/store';
import { RequestOptions } from '../http/http-service';

export const API_ERROR = 'API_ERROR ';

export class ApiError implements Action {
  readonly type = API_ERROR;

  constructor(public readonly response: any) {}
}

export const pendingApiRequest = createAction('API_REQUEST', props<{ request: RequestOptions }>());

export const completedApiRequest = createAction(
  'API_RESPONSE',
  props<{ request: RequestOptions }>()
);

export type ApiActions =
  | ApiError
  | ReturnType<typeof pendingApiRequest>
  | ReturnType<typeof completedApiRequest>;
