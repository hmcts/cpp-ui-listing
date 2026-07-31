import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { CourtCalendarContainer } from '../court-calendar.container';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, ReplaySubject, Subject } from 'rxjs';
import {
  COURT_CALENDAR_FEATURE_KEY,
  CourtCalendarActions,
  CourtCalendarFilters,
  CourtCalendarFeatureState,
  CourtRoomCalendarVM,
  HearingAllocationPayload,
  getAllocatedHearings,
  CourtCalendarFeature
} from '../../state';
import { AppConfigService } from '../../../config';
import {
  mockSearchFormValues,
  mockCourtCalendarState,
  MockunallocatedHearingData,
  MockHearing,
  mockBulkAllocatedHearings
} from '../../utils/mocks';
import { CourtCalendarFiltersComponent } from '../../components';
import { OrganisationUnit, RotaBusinessType } from '@cpp/reference-data';
import {
  HearingTableActionsStore,
  SelectedHearingState,
  SequenceEvent
} from '../../court-calendar-hearing-tables/component-store/hearing-table-actions.store';
import { Hearing, PaginatedHearings, SequenceHearing } from '../../../core';
import { HearingActionsEvent } from '../../court-calendar-hearing-tables/renderers/cell-renderers/action-cell.component';
import { filter } from 'rxjs/operators';
import { BaseHearingRowDataVM } from '../../model/hearing-table-renderer.vm';
import { AllocateHearingFactory } from '../../utils/allocate-hearing.factory';
import { setHearingsToReallocate } from '../../state/actions/court-calendar.actions';
import { WofdWarningService } from '@cpp/application';
import { ModalService } from '@cpp/pdk';
import { ChangeEndDateModalComponent } from '../../court-calendar-hearing-tables/shared/modals/change-end-date-modal.component';

class MockAppConfigService {
  getConfig() {
    return {};
  }
  getBaseUrl() {
    return '';
  }
}

class MockAllocatedHearingActionsStore {
  onSequenceHearings$ = new Subject();
  onNavigateHearingActions$ = new Subject();
  currentAction$ = new Subject();
  moveState$ = of(undefined);
  selectedHearings$ = new ReplaySubject(1);
  positionedHearingsState$ = of(undefined);

  setAction = jest.fn();
  setMoveState = jest.fn();
  setSequenceHearings = jest.fn(hearings => this.onSequenceHearings$.next(hearings));
  resetMoveState = jest.fn();
  resetState = jest.fn();
  sequenceHearings = jest.fn();
  selectAllHearings = jest.fn();
  selectHearing = jest.fn(hearing => this.selectedHearings$.next([hearing]));
}

describe('CourtCalendarContainer', () => {
  let component: CourtCalendarContainer;
  let fixture: ComponentFixture<CourtCalendarContainer>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;
  let navigate: jest.Mock;
  let mockComponentStore: MockAllocatedHearingActionsStore;
  let unallocateHearing: jest.Mock;
  let modalOpen: jest.SpyInstance;
  let modalRef: { dispose: jest.Mock };

  enum HearingDropdownActions {
    edit = 'edit',
    remove = 'remove',
    reallocate = 'reallocate',
    split = 'split'
  }
  const caseId = 'e024469d-ca7f-49da-b677-0ea58633a0ec';

  const initialState = {
    [COURT_CALENDAR_FEATURE_KEY]: mockCourtCalendarState
  };

  beforeEach(async () => {
    navigate = jest.fn();
    unallocateHearing = jest.fn(() => MockunallocatedHearingData);
    modalRef = { dispose: jest.fn() };
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: { params: { id: '1' } }
          }
        },
        {
          provide: AppConfigService,
          useClass: MockAppConfigService
        },
        {
          provide: Router,
          useValue: { navigate }
        },
        {
          provide: WofdWarningService,
          useValue: { isWofdApplication: () => false, showModal: () => {} }
        }
      ]
    })
      .overrideComponent(CourtCalendarContainer, {
        remove: {
          imports: [CourtCalendarFiltersComponent],
          providers: [HearingTableActionsStore, AllocateHearingFactory]
        },
        add: {
          imports: [MockCourtCalendarFiltersComponent]
        }
      })
      .overrideProvider(HearingTableActionsStore, {
        useValue: new MockAllocatedHearingActionsStore()
      })
      .overrideProvider(AllocateHearingFactory, {
        useValue: {
          unallocateHearing
        }
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CourtCalendarContainer);
    component = fixture.componentInstance;
    // ModalService is provided at the component level via provideModalServices(),
    // so spy on the instance from the component's element injector.
    modalOpen = jest
      .spyOn(fixture.debugElement.injector.get(ModalService), 'open')
      .mockReturnValue(modalRef as any);
    mockComponentStore = TestBed.inject(
      HearingTableActionsStore
    ) as unknown as MockAllocatedHearingActionsStore;
    mockComponentStore.selectedHearings$.next([]);
    fixture.detectChanges();
  });

  it('should create the CourtCalendarContainer component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch action on filter submission', () => {
    const searchFormValues = mockSearchFormValues;

    component.onSubmitFormFilters(searchFormValues);
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.searchCourtCalendar({ filterOptions: searchFormValues })
    );
  });

  it('should dispatch action on pageChanged with :pageNumber', () => {
    const searchFormValues = mockSearchFormValues;

    component.pageChanged({ pageNumber: 2 });
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.searchCourtCalendar({
        filterOptions: { ...searchFormValues, pageNumber: 2 }
      })
    );
  });

  it('should dispatch action on getCaseNotes for Id', () => {
    component.onGetCaseNotesForId(':mockCaseId');
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.setCaseNotesForCase({ caseId: ':mockCaseId' })
    );
  });

  it('should dispatch action for sequencedHearings', waitForAsync(() => {
    expect.assertions(1);
    mockComponentStore.setSequenceHearings([{ id: 'hearing-id' } as SequenceHearing]);
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.sequenceGroupHearings({
        sequencedHearings: [{ id: 'hearing-id' } as SequenceHearing]
      })
    );
  }));

  it('should load success alert message when present', () => {
    expect.assertions(1);
    component.alert$.pipe(filter(alert => !!alert)).subscribe(alert => {
      expect(alert.successAlert).toBe('Data successfully fetched!');
    });
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        successAlert: 'Data successfully fetched!'
      }
    } as CourtCalendarFeatureState);
    fixture.detectChanges();
  });

  it('should load failure alert message when present', () => {
    expect.assertions(1);
    component.alert$.pipe(filter(alert => !!alert)).subscribe(alert => {
      expect(alert.failureAlert).toBe('Data not fetched!');
    });
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        failureAlert: 'Data not fetched!'
      }
    } as CourtCalendarFeatureState);
    fixture.detectChanges();
  });

  it('should navigate to edit hearing when edit action is triggered', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: [mockBulkAllocatedHearings[0]]
          }
        }
      }
    } as CourtCalendarFeatureState);
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-18-03',
      endDate: '2025-18-03'
    } as CourtCalendarFilters);

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions$.next({
      action: HearingDropdownActions.edit,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    expect(navigate).toHaveBeenCalledWith([
      `court-calendar/change-hearing-details/${mockBulkAllocatedHearings[0].id}`
    ]);
  });

  it('should navigate to remove hearing when remove action is triggered', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: [mockBulkAllocatedHearings[0]]
          }
        }
      }
    } as CourtCalendarFeatureState);
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-18-03',
      endDate: '2025-18-03'
    } as CourtCalendarFilters);

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions$.next({
      action: HearingDropdownActions.remove,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    expect(navigate).toHaveBeenCalledWith([
      `court-calendar/remove-hearing/${mockBulkAllocatedHearings[0].id}`
    ]);
  });

  it('should navigate to reallocate hearings page when reallocate action is triggered', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: [mockBulkAllocatedHearings[0]]
          }
        }
      }
    } as CourtCalendarFeatureState);
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre', id: 'id' } as OrganisationUnit,
      startDate: '2025-18-03',
      endDate: '2025-18-03'
    } as CourtCalendarFilters);

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions$.next({
      action: HearingDropdownActions.reallocate,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    expect(navigate).toHaveBeenCalledWith(
      [`court-calendar/allocate-hearings/crown/id/reallocate`],
      { queryParams: { startDate: '2025-18-03', endDate: '2025-18-03' } }
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      setHearingsToReallocate({ hearings: [mockBulkAllocatedHearings[0] as Hearing] })
    );
  });

  it('should navigate to split hearing when split action is triggered', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: [mockBulkAllocatedHearings[0]]
          }
        }
      }
    } as CourtCalendarFeatureState);
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-18-03',
      endDate: '2025-18-03'
    } as CourtCalendarFilters);

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions$.next({
      action: HearingDropdownActions.split,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    expect(navigate).toHaveBeenCalledWith([`split/${mockBulkAllocatedHearings[0].id}`], {
      queryParams: { referrer: CourtCalendarFeature.calendar }
    });
  });

  describe('change-end-date action', () => {
    const details = {
      type: { description: 'Trial' },
      hearingDayCount: 3,
      endDate: '2026-01-15'
    } as unknown as Hearing;
    const rows = [{ id: 'h1', details } as unknown as BaseHearingRowDataVM];

    it('should open the change end date modal for the change-end-date action', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'h1', rows });

      expect(modalOpen).toHaveBeenCalledWith(
        ChangeEndDateModalComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            hearingTypeDescription: 'Trial',
            hearingDayCount: 3,
            endDate: '2026-01-15'
          }),
          disposeOnNavigation: true,
          disposeOnBackDropClick: false
        })
      );
    });

    it('should dispose the modal and dispatch moveHearingEndDate on continue', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'h1', rows });

      const config = modalOpen.mock.calls[0][1];
      config.data.continue('2026-02-01');

      expect(modalRef.dispose).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        CourtCalendarActions.moveHearingEndDate({ hearing: details, newEndDate: '2026-02-01' })
      );
    });

    it('should dispose the modal on cancel', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'h1', rows });

      const config = modalOpen.mock.calls[0][1];
      config.data.cancel();

      expect(modalRef.dispose).toHaveBeenCalled();
    });

    it('should not open the modal when the hearing details cannot be found', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'missing', rows: [] });

      expect(modalOpen).not.toHaveBeenCalled();
    });
  });

  it('should dispatch setCaseNotesForCase when case notes are not present for a hearing', () => {
    component.onGetCaseNotesForId(caseId);
    expect(dispatchSpy).toHaveBeenCalledWith(CourtCalendarActions.setCaseNotesForCase({ caseId }));
  });

  it('should dispatch resetAllocatedHearings when judiciary changes', () => {
    component.onJurisdictionTypeChange();
    expect(dispatchSpy).toHaveBeenCalledWith(CourtCalendarActions.resetAllocatedHearings());
  });

  it('should display error summary when errors exist', () => {
    component.errors = [{ id: '1', message: 'Invalid filter', shouldFocus: true }];
    fixture.detectChanges();

    const errorSummary = fixture.debugElement.nativeElement.querySelector('pdk-error-summary');
    expect(errorSummary).toBeTruthy();
  });

  it('should set store action and moveState if action is "move"', () => {
    const event = {
      action: 'move',
      hearingId: 'hid1',
      rowIdentifier: '',
      hearingDate: '',
      rows: []
    } as HearingActionsEvent;
    component.onHearingAction(event);

    expect(mockComponentStore.setAction).toHaveBeenCalledWith('move');
    expect(mockComponentStore.setMoveState).toHaveBeenCalledWith({
      hearingId: 'hid1',
      rowIdentifier: '',
      hearingDate: '',
      rows: []
    });
  });

  it('should call componentStore resetMoveState()', () => {
    component.onUndoHearingMove();
    expect(mockComponentStore.resetMoveState).toHaveBeenCalled();
  });

  it('should call componentStore sequenceHearings() with sequenceEvent', () => {
    const sequenceEvent = {
      hearingToMoveIds: ['hid3'],
      courtRoomId: 'court-room',
      courtCentre: {} as OrganisationUnit
    } as SequenceEvent;
    component.onHearingSequence(sequenceEvent);

    expect(mockComponentStore.sequenceHearings).toHaveBeenCalledWith(sequenceEvent);
  });

  it('should display the Add Unallocated Hearings button when courtType is CROWN', () => {
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-18-03'
    } as CourtCalendarFilters);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display Add Unallocated Hearings button when the courtType is CROWN and there are no results.', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        filterOptions: {
          courtType: 'CROWN',
          courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
          startDate: '2025-28-03'
        } as CourtCalendarFilters,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: []
          }
        }
      }
    } as CourtCalendarFeatureState);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display the Add Unallocated Hearings button when courtType is MAGISTRATES', () => {
    component.filterOptions$ = of({
      courtType: 'MAGISTRATES',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-21-05'
    } as CourtCalendarFilters);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display Add Unallocated Hearings button when the courtType is MAGISTRATES and there are no results.', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        filterOptions: {
          courtType: 'MAGISTRATES',
          courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
          startDate: '2025-28-05'
        } as CourtCalendarFilters,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: []
          }
        }
      }
    } as CourtCalendarFeatureState);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display Reallocate and Unallocate buttons only when courtType is CROWN', () => {
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-04-18'
    } as CourtCalendarFilters);

    component.courtCalendarHearingsVM$ = of({
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should display Reallocate button  when courtType is  MAGISTRATES', () => {
    component.filterOptions$ = of({
      courtType: 'MAGISTRATES',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-04-18'
    } as CourtCalendarFilters);

    component.courtCalendarHearingsVM$ = of({
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should enable Reallocate and Unallocate buttons when checkboxes are selected', () => {
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-04-18'
    } as CourtCalendarFilters);

    component.courtCalendarHearingsVM$ = of({
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });

    mockComponentStore.selectedHearings$.next([{ hearingId: 'hearing1' }]);

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should disable Reallocate and Unallocate buttons when no checkboxes are selected', () => {
    component.filterOptions$ = of({
      courtType: 'CROWN',
      courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
      startDate: '2025-04-18'
    } as CourtCalendarFilters);

    component.courtCalendarHearingsVM$ = of({
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });

    mockComponentStore.selectedHearings$.next([]);

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should dispatch unallocateHearings for unallocate action with single hearing', () => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: {
        ...mockCourtCalendarState,
        allocated: {
          courtRoomMapByDate: {},
          paginatedHearings: {
            ...mockCourtCalendarState.allocated.paginatedHearings,
            hearings: [MockHearing as Hearing]
          }
        }
      }
    } as CourtCalendarFeatureState);
    const storeNextSpy = jest.spyOn(store, 'next');
    fixture.detectChanges();
    component.onHearingAction({
      action: 'unallocate',
      hearingId: MockHearing.id,
      rowIdentifier: '',
      hearingDate: '',
      rows: [{ id: MockHearing.id } as BaseHearingRowDataVM],
      hearingDateTime: MockHearing.startDate
    });

    expect(mockComponentStore.setAction).toHaveBeenCalledWith('unallocate');
    expect(unallocateHearing).toHaveBeenCalledWith(MockHearing);
    expect(unallocateHearing).toHaveBeenCalledTimes(1);

    expect(storeNextSpy).toHaveBeenCalledWith(
      CourtCalendarActions.unallocateHearings({
        payload: {
          hearings: [MockunallocatedHearingData]
        }
      })
    );
  });
  xit('should dispatch unallocateHearings for unallocate action with multiple hearings', () => {
    const hearingsToUnallocate = [
      { hearingId: 'hearing1' },
      { hearingId: 'hearing2' }
    ] as SelectedHearingState[];

    const expectedUnallocatedHearings = [
      { hearingId: 'hearing1', startDate: '2025-04-05' },
      { hearingId: 'hearing2', startDate: '2025-04-06' }
    ] as HearingAllocationPayload[];

    unallocateHearing.mockImplementation((hearing: Hearing) =>
      expectedUnallocatedHearings.find(
        unallocatedHearing => unallocatedHearing.hearingId === hearing.id
      )
    );
    const storeNextSpy = jest.spyOn(store, 'next');
    mockComponentStore.selectedHearings$.next(hearingsToUnallocate);

    store.overrideSelector(getAllocatedHearings, {
      hearings: mockBulkAllocatedHearings
    } as PaginatedHearings);

    component.onBulkAction('unallocate');

    expect(storeNextSpy).toHaveBeenCalledWith(
      CourtCalendarActions.unallocateHearings({
        payload: {
          hearings: expectedUnallocatedHearings
        }
      })
    );
    expect(unallocateHearing).toHaveBeenCalledTimes(2);
    expect(mockComponentStore.selectAllHearings).toHaveBeenCalledWith([]);
  });
});

@Component({
  selector: 'court-calendar-filters',
  template: `
    rotaBusinessTypes: {{ rotaBusinessTypes() }} courtCentres: {{ courtCentres }} initialValues:
    {{ initialValues() }}
  `,
  standalone: true
})
class MockCourtCalendarFiltersComponent {
  readonly initialValues = input<CourtCalendarFilters>(undefined);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
}
