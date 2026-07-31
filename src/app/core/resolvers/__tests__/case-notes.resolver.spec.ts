import { TestBed } from '@angular/core/testing';
import { CaseNotesResolver } from '../case-notes.resolver';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ListingService } from '../../services';
import { cold } from 'jasmine-marbles';
import { setCaseNotes } from '../../actions';
import { AppState, HearingState } from '../../reducers';
import { Store } from '@ngrx/store';
import { ActivatedRouteSnapshot, Params, provideRouter } from '@angular/router';
import { ExtendedJudicialRole, HearingDay, ListedCase, PaginatedHearings } from '../../model';

describe('CaseNotesResolver', () => {
  let resolver: CaseNotesResolver;
  let mockStore: MockStore<AppState>;
  let getCaseNotesForCases;
  let store;

  const initialState = {
    hearings: {
      unallocated: {
        hearings: [
          {
            id: 'hearingId',
            listedCases: [
              {
                id: 'caseId'
              }
            ]
          }
        ]
      }
    }
  };

  beforeEach(() => {
    getCaseNotesForCases = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        CaseNotesResolver,
        MockStore,
        provideMockStore({ initialState }),
        {
          provide: ListingService,
          useValue: {
            getCaseNotesForCases
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    }).configureCompiler({ preserveWhitespaces: false } as any);

    resolver = TestBed.inject(CaseNotesResolver);
    mockStore = TestBed.inject(MockStore);
    store = TestBed.inject(Store);
  });

  it('should load and resolve case notes', () => {
    jest.spyOn(store, 'dispatch');
    getCaseNotesForCases.mockReturnValueOnce(cold('(a|)', { a: {} }));

    const expected$ = cold('(a|)', { a: true });
    const activate$ = resolver.resolve({
      params: { id: 'hearingId' } as Params
    } as ActivatedRouteSnapshot);

    expect(activate$).toBeObservable(expected$);
    expect(store.dispatch).toHaveBeenCalledWith(setCaseNotes({ caseNotes: { hearingId: {} } }));
  });

  it('should resolve the route if there is no cases', () => {
    mockStore.setState({
      hearings: {
        unallocated: {
          hearings: [
            {
              id: 'hearingId',
              type: {
                id: 'id',
                description: 'Trial'
              },
              allocated: false,
              jurisdictionType: 'MAGISTRATES',
              hearingLanguage: 'ENGLISH',
              listedCases: [] as ListedCase[],
              hearingDays: [] as HearingDay[],
              nonSittingDays: [] as string[],
              courtCentreId: 'court-centre-id',
              estimatedMinutes: 30,
              judiciary: [] as ExtendedJudicialRole[]
            }
          ]
        } as PaginatedHearings
      } as HearingState
    } as AppState);

    const expected$ = cold('(a|)', { a: true });
    const activate$ = resolver.resolve({
      params: { id: 'hearingId' } as Params
    } as ActivatedRouteSnapshot);

    expect(activate$).toBeObservable(expected$);
  });

  it('should resolve the route if case notes are loaded', () => {
    mockStore.setState({
      hearings: {
        unallocated: {
          hearings: [
            {
              id: 'hearingId',
              listedCases: [
                {
                  id: 'caseId'
                }
              ]
            }
          ]
        },
        caseNotes: {
          hearingId: {
            caseId: {
              id: 'caseNoteId'
            }
          }
        }
      } as unknown as HearingState
    } as AppState);

    const expected$ = cold('(a|)', { a: true });
    const activate$ = resolver.resolve({
      params: { id: 'hearingId' } as Params
    } as ActivatedRouteSnapshot);

    expect(activate$).toBeObservable(expected$);
  });
});
