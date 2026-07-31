import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, signal } from '@angular/core';
import { CourtCalendarContainer } from '../court-calendar.container';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  COURT_CALENDAR_FEATURE_KEY,
  CourtCalendarActions,
  CourtCalendarFilters,
  CourtRoomCalendarVM,
  getCourtCalendarVM
} from '../../state';
import { AppConfigService } from '../../../config';
import {
  mockSearchFormValues,
  mockCourtCalendarState,
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
import { Hearing } from '../../../core';
import { HearingActionsEvent } from '../../court-calendar-hearing-tables/renderers/cell-renderers/action-cell.component';
import { BaseHearingRowDataVM } from '../../model/hearing-table-renderer.interfaces';
import {
  setAlertMessage,
  setHearingsToReallocate
} from '../../state/actions/court-calendar.actions';
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
  onNavigateHearingActions = signal<{ action: string; hearings: string[] } | null>(null);
  moveState = signal(undefined);
  selectedHearings = signal<SelectedHearingState[]>([]);
  positionedHearingsState = signal(undefined);
  failedAllocationIds = signal<string[]>([]);

  setAction = jest.fn();
  setMoveState = jest.fn();
  resetMoveState = jest.fn();
  resetState = jest.fn();
  sequenceHearings = jest.fn();
  selectAllHearings = jest.fn();
  selectHearing = jest.fn((hearing: SelectedHearingState) => this.selectedHearings.set([hearing]));
  clearAllocationResult = jest.fn();
  clearPositionedHearings = jest.fn();
  unallocate = jest.fn();
  changeHearingEndDate = jest.fn();
}

describe('CourtCalendarContainer', () => {
  let component: CourtCalendarContainer;
  let fixture: ComponentFixture<CourtCalendarContainer>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;
  let navigate: jest.Mock;
  let mockComponentStore: MockAllocatedHearingActionsStore;
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
    [COURT_CALENDAR_FEATURE_KEY]: mockCourtCalendarState,
    referenceData: { organisationUnits: [] }
  };

  const setCalendarState = (courtCalendarState: any) => {
    store.setState({
      [COURT_CALENDAR_FEATURE_KEY]: courtCalendarState,
      referenceData: { organisationUnits: [] }
    } as any);
  };

  beforeEach(async () => {
    navigate = jest.fn();
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
          providers: [HearingTableActionsStore]
        },
        add: {
          imports: [MockCourtCalendarFiltersComponent]
        }
      })
      .overrideProvider(HearingTableActionsStore, {
        useValue: new MockAllocatedHearingActionsStore()
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

  it('should load success alert message when present', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      successAlert: 'Data successfully fetched!'
    });
    fixture.detectChanges();
    expect(component.alertState()).toEqual({
      successAlert: 'Data successfully fetched!',
      failureAlert: undefined
    });
  });

  it('should load failure alert message when present', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      failureAlert: 'Data not fetched!'
    });
    fixture.detectChanges();
    expect(component.alertState()).toEqual({
      successAlert: undefined,
      failureAlert: 'Data not fetched!'
    });
  });

  it('should navigate to edit hearing when edit action is triggered', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-18-03',
        endDate: '2025-18-03'
      } as CourtCalendarFilters,
      allocated: {
        courtRoomMapByDate: {},
        paginatedHearings: {
          ...mockCourtCalendarState.allocated.paginatedHearings,
          hearings: [mockBulkAllocatedHearings[0]]
        }
      }
    });

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions.set({
      action: HearingDropdownActions.edit,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith([
      `court-calendar/change-hearing-details/${mockBulkAllocatedHearings[0].id}`
    ]);
  });

  it('should navigate to remove hearing when remove action is triggered', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-18-03',
        endDate: '2025-18-03'
      } as CourtCalendarFilters,
      allocated: {
        courtRoomMapByDate: {},
        paginatedHearings: {
          ...mockCourtCalendarState.allocated.paginatedHearings,
          hearings: [mockBulkAllocatedHearings[0]]
        }
      }
    });

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions.set({
      action: HearingDropdownActions.remove,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith([
      `court-calendar/remove-hearing/${mockBulkAllocatedHearings[0].id}`
    ]);
  });

  it('should navigate to reallocate hearings page when reallocate action is triggered', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre', id: 'id' } as OrganisationUnit,
        startDate: '2025-18-03',
        endDate: '2025-18-03'
      } as CourtCalendarFilters,
      allocated: {
        courtRoomMapByDate: {},
        paginatedHearings: {
          ...mockCourtCalendarState.allocated.paginatedHearings,
          hearings: [mockBulkAllocatedHearings[0]]
        }
      }
    });

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions.set({
      action: HearingDropdownActions.reallocate,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith([`court-calendar/allocate-hearings/id/reallocate`], {
      queryParams: {
        startDate: '2025-18-03',
        endDate: '2025-18-03',
        jurisdiction: 'CROWN',
        businessType: undefined,
        courtRoomId: undefined,
        courtSession: undefined,
        hearingType: undefined
      }
    });
    expect(dispatchSpy).toHaveBeenCalledWith(
      setHearingsToReallocate({ hearings: [mockBulkAllocatedHearings[0] as Hearing] })
    );
  });

  it('should navigate to split hearing when split action is triggered', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-18-03',
        endDate: '2025-18-03'
      } as CourtCalendarFilters,
      allocated: {
        courtRoomMapByDate: {},
        paginatedHearings: {
          ...mockCourtCalendarState.allocated.paginatedHearings,
          hearings: [mockBulkAllocatedHearings[0]]
        }
      }
    });

    fixture.detectChanges();
    mockComponentStore.onNavigateHearingActions.set({
      action: HearingDropdownActions.split,
      hearings: [mockBulkAllocatedHearings[0].id]
    });
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith([`split/${mockBulkAllocatedHearings[0].id}`], {
      queryParams: { referrer: 'CALENDAR' }
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
      expect(mockComponentStore.selectHearing).not.toHaveBeenCalled();
    });

    it('should dispose the modal and ask the store to change the end date on continue', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'h1', rows });

      const config = modalOpen.mock.calls[0][1];
      config.data.continue('2026-02-01');

      expect(modalRef.dispose).toHaveBeenCalled();
      expect(mockComponentStore.changeHearingEndDate).toHaveBeenCalledWith(
        expect.objectContaining({ hearing: details, newEndDate: '2026-02-01' })
      );
    });

    it('should refresh the calendar and show the success alert once the end date has changed', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'h1', rows });
      modalOpen.mock.calls[0][1].data.continue('2026-02-01');

      const { onSuccess } = mockComponentStore.changeHearingEndDate.mock.calls[0][0];
      onSuccess({ previousEndDate: '2026-01-15', newEndDate: '2026-02-01' });

      expect(dispatchSpy).toHaveBeenCalledWith(
        CourtCalendarActions.searchCourtCalendar({
          filterOptions: mockCourtCalendarState.filterOptions
        })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        setAlertMessage({
          successAlert: 'Hearing date successfully changed from 15 January 2026 to 1 February 2026'
        })
      );
    });

    it('should dispose the modal on cancel', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'h1', rows });

      modalOpen.mock.calls[0][1].data.cancel();

      expect(modalRef.dispose).toHaveBeenCalled();
    });

    it('should not open the modal when the hearing details cannot be found', () => {
      component.onHearingAction({ action: 'change-end-date', hearingId: 'missing', rows: [] });

      expect(modalOpen).not.toHaveBeenCalled();
      expect(mockComponentStore.changeHearingEndDate).not.toHaveBeenCalled();
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

    expect(mockComponentStore.sequenceHearings).toHaveBeenCalledWith(
      expect.objectContaining(sequenceEvent)
    );
  });

  it('should display the Add Unallocated Hearings button when courtType is CROWN', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-18-03'
      } as CourtCalendarFilters
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display Add Unallocated Hearings button when the courtType is CROWN and there are no results.', () => {
    setCalendarState({
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
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display the Add Unallocated Hearings button when courtType is MAGISTRATES', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'MAGISTRATES',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-21-05'
      } as CourtCalendarFilters
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display Add Unallocated Hearings button when the courtType is MAGISTRATES and there are no results.', () => {
    setCalendarState({
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
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display Reallocate and Unallocate buttons only when courtType is CROWN', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-04-18'
      } as CourtCalendarFilters
    });
    store.overrideSelector(getCourtCalendarVM, {
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });
    store.refreshState();
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should display Reallocate button  when courtType is  MAGISTRATES', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'MAGISTRATES',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-04-18'
      } as CourtCalendarFilters
    });
    store.overrideSelector(getCourtCalendarVM, {
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });
    store.refreshState();
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should enable Reallocate and Unallocate buttons when checkboxes are selected', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-04-18'
      } as CourtCalendarFilters
    });
    store.overrideSelector(getCourtCalendarVM, {
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });
    store.refreshState();
    mockComponentStore.selectedHearings.set([{ hearingId: 'hearing1', hearingDateTime: '' }]);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should disable Reallocate and Unallocate buttons when no checkboxes are selected', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      filterOptions: {
        courtType: 'CROWN',
        courtCentre: { oucodeL3Name: 'Mock Centre' } as OrganisationUnit,
        startDate: '2025-04-18'
      } as CourtCalendarFilters
    });
    store.overrideSelector(getCourtCalendarVM, {
      courtRoomCalendars: [{ judiciaryCalendar: [] }] as CourtRoomCalendarVM[]
    });
    store.refreshState();
    mockComponentStore.selectedHearings.set([]);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should call store.unallocate for unallocate action with single hearing', () => {
    setCalendarState({
      ...mockCourtCalendarState,
      allocated: {
        courtRoomMapByDate: {},
        paginatedHearings: {
          ...mockCourtCalendarState.allocated.paginatedHearings,
          hearings: [MockHearing as Hearing]
        }
      }
    });
    fixture.detectChanges();
    component.onHearingAction({
      action: 'unallocate',
      hearingId: MockHearing.id,
      rowIdentifier: '',
      hearingDate: '',
      rows: [{ id: MockHearing.id } as BaseHearingRowDataVM],
      hearingDateTime: MockHearing.startDate
    });

    expect(mockComponentStore.unallocate).toHaveBeenCalledWith(
      expect.objectContaining({
        hearings: [MockHearing],
        jurisdiction: mockCourtCalendarState.filterOptions.courtType,
        ouCode: mockCourtCalendarState.filterOptions.courtCentre?.oucode
      })
    );
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
