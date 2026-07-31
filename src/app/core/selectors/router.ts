import { getRouterSelectors } from '@ngrx/router-store';
import { AppState } from '../reducers';

export const getRouter = (state: AppState) => state.router;

const { selectQueryParam, selectUrl, selectQueryParams, selectRouteParams, selectRouteData } =
  getRouterSelectors(getRouter);

export const getQueryParam = selectQueryParam;
export const getQueryParams = selectQueryParams;
export const getCurrentUrl = selectUrl;
export const getRouteParams = selectRouteParams;
export const getRouteData = selectRouteData;
