import { JudiciariesLoadGuard } from '../judiciaries-load';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../reducers';
import { TestBed } from '@angular/core/testing';
import { listingReferenceDataReducer } from '../../reducers/reference-data';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { LoadJudiciariesSuccessAction } from '../../actions/reference-data';
import { of } from 'rxjs/internal/observable/of';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ReferenceDataService } from '@cpp/reference-data';

describe('JudiciariesLoadGuard', () => {
  let guard: JudiciariesLoadGuard;
  let store: Store<AppState>;

  let fetchJudicialMembers: jest.Mock;
  let navigate: jest.Mock;

  beforeEach(() => {
    fetchJudicialMembers = jest.fn();
    navigate = jest.fn();

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {
            listingReferenceData: listingReferenceDataReducer
          },
          {
            runtimeChecks: {}
          }
        )
      ],
      providers: [
        JudiciariesLoadGuard,
        {
          provide: ReferenceDataService,
          useValue: {
            fetchJudicialMembers
          }
        },
        {
          provide: Router,
          useValue: {
            navigate
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });

    guard = TestBed.inject(JudiciariesLoadGuard);
    store = TestBed.inject(Store);

    jest.spyOn(store, 'dispatch');
  });

  const createSnapshot = () => {
    return new ActivatedRouteSnapshot();
  };

  it('should resolve to true when judiciaries exist in the store', () => {
    expect.assertions(1);
    const snapshot = createSnapshot();

    store.dispatch(new LoadJudiciariesSuccessAction([]));

    guard.canActivate(snapshot).subscribe((didResolve) => {
      expect(didResolve).toBe(true);
    });
  });

  it('should resolve to true after fetching judiciaries from the server when not found in the store', () => {
    expect.assertions(2);
    const snapshot = createSnapshot();

    fetchJudicialMembers.mockReturnValue(of([]));

    guard.canActivate(snapshot).subscribe((didResolve) => {
      expect(didResolve).toBe(true);
      expect(store.dispatch).toHaveBeenCalledWith(new LoadJudiciariesSuccessAction([]));
    });
  });

  it('should reject the activation when there is an error fetching the judiciaries', () => {
    expect.assertions(2);
    const error = new HttpErrorResponse({ status: 500 });
    const snapshot = createSnapshot();

    fetchJudicialMembers.mockReturnValue(throwError(error));

    guard.canActivate(snapshot).subscribe((didResolve) => {
      expect(didResolve).toBe(false);
      expect(navigate).toHaveBeenCalledWith('/technical-error');
    });
  });
});
