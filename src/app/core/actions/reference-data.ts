import { JudicialMember } from '@cpp/reference-data';
import { Action } from '@ngrx/store';

export const LOAD_JUDICIARIES = 'LOAD_JUDICIARIES';
export const LOAD_JUDICIARIES_SUCCESS = 'LOAD_JUDICIARIES_SUCCESS';

export class LoadJudiciariesAction implements Action {
  readonly type = LOAD_JUDICIARIES;
}

export class LoadJudiciariesSuccessAction implements Action {
  readonly type = LOAD_JUDICIARIES_SUCCESS;

  constructor(public payload: JudicialMember[]) {}
}

export type ReferenceDataAction = LoadJudiciariesAction | LoadJudiciariesSuccessAction;
