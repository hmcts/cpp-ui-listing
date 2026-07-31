import { TestBed } from '@angular/core/testing';
import { HearingType, ReferenceDataActions, TrialType } from '@cpp/reference-data';
import { provideStore, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { CourtCentre } from '../model';
import { AppState, reducers } from '../reducers';
import { getCourtCentres, getHearingTypes } from '../selectors';
import { getTrialTypesFilteredByType } from './reference-data';

let store: Store<AppState>;

const mockCourtCentre: CourtCentre = {
  id: '1',
  name: 'Liverpool',
  defaultStartTime: '10:00',
  defaultDuration: '6',
  courtCode: undefined,
  courtRooms: []
};

const trialType = {
  id: 'mock-id',
  reasonCode: 'mock-reason-code',
  trialType: 'Vacated',
  jurisdiction: 'mock-jurisdiction',
  reasonShortDescription: 'mock-reason-short-code'
} as TrialType;

const expectedTrialTypes = [
  {
    ...trialType,
    label: 'mock-reason-short-code',
    value: 'mock-id'
  }
] as TrialType[];

describe('reference-data selectors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} })],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(Store);
  });

  it('should return the state of the hearing types', () => {
    const hearingTypesFromCore = [{ id: '1', hearingDescription: 'test1' }] as HearingType[];
    store.dispatch(
      ReferenceDataActions.loadHearingTypesSuccess({ hearingTypes: hearingTypesFromCore })
    );
    const hearingTypes = [{ id: '1', name: 'test1' }];
    let result;
    store.select(getHearingTypes).subscribe((value) => (result = value));
    expect(result).toEqual(hearingTypes);
  });

  it('should return the state of the courtCentres', () => {
    const organisationUnitsFromCore = [
      {
        id: '1',
        oucodeL3Code: 'LCC',
        oucodeL3Name: 'Liverpool',
        defaultStartTime: '10:00',
        defaultDurationHrs: '6',
        courtRooms: []
      }
    ];
    store.dispatch(
      ReferenceDataActions.loadOrganisationUnitsSuccess({
        organisationUnits: organisationUnitsFromCore
      })
    );
    let result;

    store.select(getCourtCentres).subscribe((value) => (result = value));

    expect(result).toEqual([mockCourtCentre]);
  });

  it('should get the trial types from the store', () => {
    let state: AppState;
    store.dispatch(ReferenceDataActions.loadTrialTypesSuccess({ trialTypes: [trialType] }));
    store.pipe(take(1)).subscribe((val) => (state = val));
    expect(getTrialTypesFilteredByType(state)).toEqual(expectedTrialTypes);
  });

  it('should return vacated trial types', () => {
    store.dispatch(ReferenceDataActions.loadTrialTypesSuccess({ trialTypes: [trialType] }));

    store.select(getTrialTypesFilteredByType).subscribe((value) => {
      expect(value).toEqual(
        expect.arrayContaining([expect.objectContaining({ value: 'Vacated' })])
      );
    });
  });
});
