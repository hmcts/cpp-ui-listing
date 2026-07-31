import { JudicialMember } from '@cpp/reference-data';
import { ReferenceDataAction } from '../actions/reference-data';
import * as ReferenceDataActions from '../actions/reference-data';

export interface ListingReferenceDataState {
  judiciaries: JudicialMember[];
}

const initialState: ListingReferenceDataState = {
  judiciaries: undefined
};

export function listingReferenceDataReducer(
  state: ListingReferenceDataState = initialState,
  action: ReferenceDataAction
): ListingReferenceDataState {
  switch (action.type) {
    case ReferenceDataActions.LOAD_JUDICIARIES_SUCCESS:
      return {
        ...state,
        judiciaries: [...action.payload]
      };

    default:
      return state;
  }
}
