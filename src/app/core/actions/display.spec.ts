import {
  ShowUnallocatedHearingsAction,
  UnallocatedPageVisitedAction,
  ShowUnscheduledHearingsAction,
  UnscheduledPageVisitedAction
} from './display';
import * as DisplayActions from './display';

describe('Display actions', () => {
  it('Should create a ShowUnallocatedHearingsAction action', () => {
    const action = new ShowUnallocatedHearingsAction(true);
    expect({ ...action }).toEqual({
      type: DisplayActions.SHOW_UNALLOCATED_HEARINGS,
      payload: true
    });
  });

  it('Should create a ShowUnscheduledHearingsAction action', () => {
    const action = new ShowUnscheduledHearingsAction(true);
    expect({ ...action }).toEqual({
      type: DisplayActions.SHOW_UNSCHEDULED_HEARINGS,
      payload: true
    });
  });

  it('Should create a UnallocatedPageVisitedAction action', () => {
    const action = new UnallocatedPageVisitedAction();
    expect({ ...action }).toEqual({
      type: DisplayActions.UNALLOCATED_PAGE_VISITED
    });
  });

  it('Should create a UnscheduledPageVisitedAction action', () => {
    const action = new UnscheduledPageVisitedAction();
    expect({ ...action }).toEqual({
      type: DisplayActions.UNSCHEDULED_PAGE_VISITED
    });
  });
});
