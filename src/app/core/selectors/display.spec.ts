import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { JurisdictionType } from '..';
import * as fromActions from '../actions/display';
import * as fromRoot from '../reducers/index';
import * as fromSeletors from '../selectors/display';

let store: Store<fromRoot.AppState>;

describe('Display selectors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(fromRoot.reducers, { runtimeChecks: {} })],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(Store);
  });

  it('should return the state of the display.showUnallocatedHearings', () => {
    let result;

    store.select(fromSeletors.showUnallocatedHearings).subscribe((value) => (result = value));

    expect(result).toEqual(false);
    store.dispatch(new fromActions.ShowUnallocatedHearingsAction(true));
    expect(result).toEqual(true);
  });

  it('should return the state of the display.showUnscheduledHearings', () => {
    let result;

    store.select(fromSeletors.showUnscheduledHearings).subscribe((value) => (result = value));

    expect(result).toEqual(false);
    store.dispatch(new fromActions.ShowUnscheduledHearingsAction(true));
    expect(result).toEqual(true);
  });

  it('should return the state of the display.isUnscheduledPageVisited', () => {
    let result;

    store.select(fromSeletors.isUnscheduledPageVisited).subscribe((value) => (result = value));

    expect(result).toEqual(false);
    store.dispatch(new fromActions.UnscheduledPageVisitedAction());
    expect(result).toEqual(true);
  });

  it('should return the state of the display.isUnallocatedPageVisited', () => {
    let result;

    store.select(fromSeletors.isUnallocatedPageVisited).subscribe((value) => (result = value));

    expect(result).toEqual(false);
    store.dispatch(new fromActions.UnallocatedPageVisitedAction());
    expect(result).toEqual(true);
  });

  it('should return the state of the display.getSelectedHearingFilters', () => {
    let result;
    const initialFilters = {
      courtCentreId: 'ALL',
      authorityId: 'ALL',
      hearingTypeId: 'ALL',
      jurisdictionType: 'ALL',
      possibleDisqualification: 'ALL'
    };

    const mockFilters = {
      courtCentreId: '0aa539a5-58e4-4670-91f8-ef0674defaae',
      authorityId: 'c5c87cbb-6f4d-418c-8e8f-3e6be37c99b0',
      hearingTypeId: 'c0d1c437-3409-4907-a324-f20413b22f46',
      jurisdictionType: 'CROWN' as JurisdictionType
    };

    store.select(fromSeletors.getSelectedHearingFilters).subscribe((value) => (result = value));
    expect(result).toEqual(initialFilters);
    store.dispatch(new fromActions.SaveHearingFiltersAction(mockFilters));
    expect(result).toEqual(mockFilters);
  });

  it('should return the state of the display.getSelectedUnscheduledHearingFilters', () => {
    let result;
    const initialFilters = {
      oucodeL2Code: 'ALL',
      courtCentreId: 'ALL',
      typeOfList: 'ALL',
      caseUrn: ''
    };

    const mockFilters = {
      oucodeL2Code: '01',
      courtCentreId: '54890ac3-4b4a-44e8-8108-b85a5a4be31f',
      typeOfList: 'a027699d-fc3c-445b-9f00-41c99c295d98',
      caseUrn: 'TEST-CASE-URN'
    };

    store
      .select(fromSeletors.getSelectedUnscheduledHearingFilters)
      .subscribe((value) => (result = value));
    expect(result).toEqual(initialFilters);
    store.dispatch(new fromActions.SaveUnscheduledFiltersAction(mockFilters));
    expect(result).toEqual(mockFilters);
  });
});
