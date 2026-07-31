import { AppState } from '../reducers';

export const getHasApiActivity = (state: AppState) => state?.api?.requests.length > 0;
export const getHasApiError = (state: AppState) => state?.api?.errors.length > 0;
