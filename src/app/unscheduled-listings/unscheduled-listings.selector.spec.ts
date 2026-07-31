import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import * as fromRoot from '../../app/core/reducers';
import * as fromActions from '../../app/core/actions';
import {
  getUnscheduledHearingsCount,
  getUnscheduledHearingsForAllApplications,
  getUnscheduledHearingsForAllDefendants
} from './unscheduled-listings.selector';
import { hearing1, hearing2, mockResultOne, mockResultTwo } from './mock-data/mock-data';

let store: Store<fromRoot.AppState>;

describe('hearing selectors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(fromRoot.reducers, { runtimeChecks: {} })],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(Store);
  });

  describe('getUnscheduledHearingsForAllDefendants', () => {
    beforeEach(() => {
      store.dispatch(
        new fromActions.ListUnscheduledHearingsSuccessAction({
          hearings: [hearing1],
          pagination: { pageCount: 1, totalNumber: 50 }
        })
      );
    });

    it('should return the state of all the unscheduled hearings', () => {
      let result;

      store.select(getUnscheduledHearingsForAllDefendants).subscribe((value) => (result = value));

      expect(result).toEqual(mockResultOne);
    });
  });

  describe('getUnscheduledHearingsForAllApplications', () => {
    beforeEach(() => {
      store.dispatch(
        new fromActions.ListUnscheduledHearingsSuccessAction({
          hearings: [hearing2],
          pagination: { pageCount: 1, totalNumber: 50 }
        })
      );
    });

    it('should return the state of all the unscheduled hearings', () => {
      let result;

      store.select(getUnscheduledHearingsForAllApplications).subscribe((value) => (result = value));

      expect(result).toEqual(mockResultTwo);
    });
  });

  describe('getUnscheduledHearingsCount', () => {
    beforeEach(() => {
      store.dispatch(
        new fromActions.ListUnscheduledHearingsSuccessAction({
          hearings: [hearing1, hearing2],
          pagination: { pageCount: 1, totalNumber: 50 }
        })
      );
    });

    it('should return the state of all the unscheduled hearings', () => {
      let result;

      store.select(getUnscheduledHearingsCount).subscribe((value) => (result = value));

      expect(result).toEqual(2);
    });
  });
});
