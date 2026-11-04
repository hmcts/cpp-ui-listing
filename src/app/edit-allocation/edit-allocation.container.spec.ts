import { Component, input } from '@angular/core';
import {
  AppState,
  CourtroomsFilter,
  FilterOption,
  Hearing,
  HearingWithSelectedCourtCentre,
  SearchAllocatedHearingsAction,
  UpdateAllocatedHearingAction
} from '../core/';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EditAllocationContainer } from './edit-allocation.container';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import {
  courtCentresMock,
  editAllocationError,
  validHearingMock1
} from '../../mock-data/test-fixtures';
import { AppConfigService } from '../../app/config';
import { DailyCourtRoomCalendarContainer } from '../daily-court-room-calendar/daily-court-room-calendar.container';
import { By } from '@angular/platform-browser';
import { ModalService } from '@cpp/pdk';
import { ENFORCEMENT_AUTHORITY_CODE, PAST_DATE_MESSAGES, PastDateCheck } from '../core/util';
import { PastDateWarningModalComponent } from '../allocation/components/past-date-warning-modal.component';

@Component({
  template: ` <edit-allocation> </edit-allocation> `,
  imports: [EditAllocationContainer]
})
class TestHostComponent {}

describe('EditAllocationContainer', () => {
  let component: EditAllocationContainer;
  let router: Router;
  let fixture: ComponentFixture<TestHostComponent>;
  let scrollSpy;
  let selectSpy;
  let dispatchSpy;
  let getBaseUrlSpy;
  const store: Store<AppState> = null;
  const filterOptions: CourtroomsFilter = {
    courtCentreId: 'courtCentreId',
    courtRoomId: 'courtRoomId',
    searchDate: '2018-10-10'
  };

  const testHearing: Hearing = validHearingMock1;

  const testHearingWithSelectedCourtCentre: HearingWithSelectedCourtCentre = {
    ...testHearing,
    selectedCourtCentre: {
      id: testHearing.courtCentreId,
      courtRoomId: testHearing.courtRoomId,
      courtCentreName: 'any'
    }
  };

  const createComponent = (params = {}) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: EditAllocationContainer },
          { path: 'unallocated', component: TestComponent }
        ]),
        { provide: Store, useValue: { select: selectSpy, dispatch: dispatchSpy } },
        { provide: AppConfigService, useValue: { getBaseUrl: getBaseUrlSpy } },
        { provide: 'Window', useValue: { scroll: scrollSpy } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: params
            }
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    }).overrideComponent(EditAllocationContainer, {
      remove: {
        imports: [DailyCourtRoomCalendarContainer]
      },
      add: {
        imports: [DailyCourtRoomCalendarContainerMock]
      }
    });
  };

  @Component({
    template: ''
  })
  class TestComponent {}

  @Component({
    selector: 'daily-court-room-calendar',
    template: ''
  })
  class DailyCourtRoomCalendarContainerMock {
    readonly filterOptions = input<CourtroomsFilter>(undefined);
    readonly enableAction = input(false);
    readonly selectedHearingId = input(undefined);
    clearSelectedHearing = jasmine.createSpy('clearSelectedHearing');
  }

  const hearingWithVacatedTrialId = {
    ...testHearing,
    vacatedTrialReasonId: 'mock-vacated-trial-reason-id'
  };

  const hearings = {
    allocated: [hearingWithVacatedTrialId]
  };

  const referenceData = {
    hearingTypes: [],
    organisationUnits: [
      {
        id: '9b583616-049b-30f9-a14f-028a53b7cfe8',
        oucodeL3Code: 'LCC',
        oucodeL3Name: 'Liverpool Crown Court',
        defaultStartTime: '10:30',
        defaultDurationHrs: '6',
        courtrooms: [
          {
            id: 'e7721a38-546d-4b56-9992-ebdd772a561b',
            courtroomName: 'Courtroom 3-1'
          },
          {
            id: '63c20849-89f7-4140-8bf3-96a13f57c446',
            courtroomName: 'Courtroom 3-2'
          }
        ]
      }
    ],
    trialTypes: [
      {
        id: 'a1d0c6e8-3f02-3327-9846-1063f4ac58a6',
        seqNo: 42,
        reasonCode: 'A',
        trialType: 'Vacated',
        jurisdiction: 'CC',
        reasonShortDescription:
          'Prosecution end case – Prosecution discontinue case prior to trial date'
      }
    ]
  };

  beforeEach(() => {
    scrollSpy = jasmine.createSpy('scroll');
    const state = {
      hearings,
      referenceData
    };
    selectSpy = jasmine.createSpy('select').and.callFake(selectorFunc => {
      return of(selectorFunc.call(store, state));
    });
    dispatchSpy = jasmine.createSpy('dispatch');
    getBaseUrlSpy = jasmine.createSpy().and.returnValue('http://url.com');
  });

  describe('Normal behaviour', () => {
    beforeEach(() => {
      createComponent(false);
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.debugElement.query(
        By.directive(EditAllocationContainer)
      ).componentInstance;
      component.showSubmenu = false;
      router = TestBed.inject<Router>(Router);
      router.navigate = jest.fn();
      fixture.detectChanges();
    });

    it('should match Jest snapshot', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should have the correct breadcrumb set for this component', () => {
      const breadcrumbs: Breadcrumb[] = [
        { title: 'Home', href: 'http://url.com' },
        { title: 'Allocated hearings' }
      ];
      expect(component.breadcrumbs).toEqual(breadcrumbs);
    });

    it('#onHearingSelected', fakeAsync(() => {
      component.onHearingSelected(testHearing);
      tick();

      expect(component.selectedHearing).toEqual(testHearing);
    }));

    it('#canActivateSplit', fakeAsync(() => {
      expect(component.canActivateSplit(testHearing)).toBe(true);
    }));

    it('#splitHearing', fakeAsync(() => {
      const spy = (router.navigate = jest.fn());
      spy.mockResolvedValue(() => {});
      component.splitHearing(testHearing);
      expect(router.navigate).toHaveBeenCalledWith([`/split/${testHearing.id}`]);
    }));

    it('#onSelectCourtCentre', fakeAsync(() => {
      component.onSelectCourtCentre({ value: courtCentresMock[0].id } as FilterOption);
      tick();
      expect(component.selectedCourtCentre).toEqual(courtCentresMock[0]);
    }));

    it('#updateHearing', fakeAsync(() => {
      const expectedAction = new UpdateAllocatedHearingAction({
        originHearing: testHearingWithSelectedCourtCentre,
        updatedHearing: testHearingWithSelectedCourtCentre
      });

      component.selectedHearing = testHearing;
      component.updateHearing({
        originHearing: testHearingWithSelectedCourtCentre,
        updatedHearing: testHearingWithSelectedCourtCentre
      });
      tick();
      expect(component.selectedHearing).toEqual(undefined);
      expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(expectedAction);
      expect(component.dailyCourtRoomCalendarContainer.clearSelectedHearing).toHaveBeenCalledTimes(
        1
      );
    }));

    it('#filterSubmit', fakeAsync(() => {
      const expectedAction = new SearchAllocatedHearingsAction({ options: filterOptions });

      component.filterSubmit(filterOptions);
      tick();
      expect(component.filterOptions).toEqual(filterOptions);
      expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(expectedAction);
    }));

    it('#clearSelectedHearing', fakeAsync(() => {
      component.selectedHearing = testHearing;
      component.clearSelectedHearing();
      tick();
      expect(component.selectedHearing).toEqual(undefined);
      expect(component.dailyCourtRoomCalendarContainer.clearSelectedHearing).toHaveBeenCalledTimes(
        1
      );
    }));

    it('should display edit allocation error', fakeAsync(() => {
      component.errors = [editAllocationError];
      tick();

      expect(fixture).toMatchSnapshot();
    }));

    describe('amending to a past date', () => {
      const today = '2026-10-23';
      const enforcementHearing: Hearing = {
        ...testHearing,
        startDate: '2026-10-10',
        listedCases: testHearing.listedCases.map(listedCase => ({
          ...listedCase,
          caseIdentifier: {
            ...listedCase.caseIdentifier,
            authorityCode: ENFORCEMENT_AUTHORITY_CODE
          }
        }))
      };
      const amend = (originHearing: Hearing, startDate: string) => ({
        originHearing,
        updatedHearing: { ...originHearing, startDate }
      });
      let modalService: ModalService;
      let modalRef: { dispose: jest.Mock };

      beforeEach(() => {
        jest
          .spyOn(component['dateUtil'], 'getCurrentDate')
          .mockReturnValue(new Date(`${today}T10:00:00`));
        modalService = fixture.debugElement
          .query(By.directive(EditAllocationContainer))
          .injector.get(ModalService);
        modalRef = { dispose: jest.fn() };
        jest.spyOn(modalService, 'open').mockReturnValue(modalRef as any);
        dispatchSpy.calls.reset();
      });

      it('saves without a warning when the date is not changed', () => {
        component.updateHearing(amend(enforcementHearing, '2026-10-10'));

        expect(modalService.open).not.toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledWith(
          new UpdateAllocatedHearingAction(amend(enforcementHearing, '2026-10-10'))
        );
      });

      it('saves without a warning when the date is changed to today or later', () => {
        component.updateHearing(amend(enforcementHearing, '2026-10-30'));

        expect(modalService.open).not.toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
      });

      it('shows a warning and saves on Continue for an Enforcement case within 31 days', () => {
        const hearingDetails = amend(enforcementHearing, '2026-10-01');
        component.updateHearing(hearingDetails);

        expect(modalService.open).toHaveBeenCalledWith(
          PastDateWarningModalComponent,
          expect.anything()
        );
        expect(dispatchSpy).not.toHaveBeenCalled();

        const { data } = (modalService.open as jest.Mock).mock.calls[0][1];
        data.continue();

        expect(modalRef.dispose).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledWith(new UpdateAllocatedHearingAction(hearingDetails));
      });

      it('does not save when the warning is cancelled', () => {
        component.updateHearing(amend(enforcementHearing, '2026-10-01'));
        const { data } = (modalService.open as jest.Mock).mock.calls[0][1];
        data.cancel();

        expect(modalRef.dispose).toHaveBeenCalled();
        expect(dispatchSpy).not.toHaveBeenCalled();
      });

      it('shows an error and does not save for an Enforcement case more than 31 days back', () => {
        component.selectedHearing = enforcementHearing;
        component.updateHearing(amend(enforcementHearing, '2026-09-21'));

        expect(component.errors).toEqual([
          { id: 'dateRange', message: PAST_DATE_MESSAGES[PastDateCheck.TooFarInPast] }
        ]);
        expect(component.selectedHearing).toEqual(enforcementHearing);
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(modalService.open).not.toHaveBeenCalled();
      });

      it('shows an error and does not save for a non-Enforcement case', () => {
        const hearing = { ...testHearing, startDate: '2026-10-30' };
        component.updateHearing(amend(hearing, '2026-10-22'));

        expect(component.errors).toEqual([
          { id: 'dateRange', message: PAST_DATE_MESSAGES[PastDateCheck.NotEnforcementCase] }
        ]);
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(modalService.open).not.toHaveBeenCalled();
      });
    });
  });
});
