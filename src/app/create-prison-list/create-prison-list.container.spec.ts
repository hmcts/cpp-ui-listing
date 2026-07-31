import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { Action, Store } from '@ngrx/store';
import { of, EMPTY, Observable } from 'rxjs';

import { AppState, HearingState, searchAllocatedHearingsForPrisonListAction } from '../core';
import { Hearing, UnallocatedHearings } from '../core/model/hearing';
import { CreatePrisonListContainer } from './create-prison-list.container';
import { Title } from '@angular/platform-browser';
import { courtCentresMock } from '../../mock-data/test-fixtures';
import { provideRouter, Router } from '@angular/router';
import { validHearingMock1 } from '../../mock-data/test-fixtures';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';

const onHearingSelectedMock = jest.fn();

@Component({
  template: ` <create-prison-list> </create-prison-list> `,
  imports: [CreatePrisonListContainer]
})
class TestHostComponent {
  onHearingSelected = onHearingSelectedMock;
  hearing = validHearingMock1;
}

describe('CreatePrisonListContainer', () => {
  let component: CreatePrisonListContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let state;
  let dispatchSpy;
  let selectSpy;
  let titleServiceSpy;
  let navigateSpy;
  let scrollSpy;
  let createObjectURL: jasmine.Spy;
  let open: jasmine.Spy;
  let actions$ = new Observable<Action>();

  const store: Store<AppState> = null;
  const hearings: Hearing[] = [];

  const hearingState: HearingState = {
    unallocated: { hearings, pagination: { currentPage: 1 } } as UnallocatedHearings,
    allocated: hearings,
    lastAllocatedHearing: null,
    restrictedHearing: null,
    restrictListExpanded: null,
    weekcommencingHearing: null,
    publishCourtListStatuses: null,
    scheduledHearingForAllocation: null,
    hearingSchedule: null
  } as HearingState;
  const refefenceDataState = {
    applicationTypes: [],
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
    prosecutors: []
  };

  const usersGroupsState = {
    permissionsMap: {},
    userGroups: []
  };

  beforeEach(fakeAsync(() => {
    state = {
      hearings: hearingState,
      referenceData: refefenceDataState,
      usersGroups: usersGroupsState
    };
    selectSpy = jasmine.createSpy('select').and.callFake((selectorFunc) => {
      return of(selectorFunc.call(store, state));
    });
    titleServiceSpy = jasmine.createSpy('setTile');
    dispatchSpy = jasmine.createSpy('dispatch');
    navigateSpy = jasmine.createSpy('navigate').and.returnValue(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    scrollSpy = jasmine.createSpy('scroll');
    createObjectURL = jasmine.createSpy();
    open = jasmine.createSpy();
    const windowMock: Window = <any>{
      URL: { createObjectURL },
      open,
      scroll: scrollSpy
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideMockActions(() => actions$),
        {
          provide: Store,
          useValue: { select: selectSpy, dispatch: dispatchSpy, pipe: jest.fn }
        },
        { provide: Title, useValue: { setTitle: titleServiceSpy } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: 'Window', useFactory: () => windowMock }
      ],
      teardown: { destroyAfterEach: false }
    });
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  }));

  describe('General', () => {
    it('should match Jest snapshot', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should set the errors', () => {
      component.formErrors([{ test: 'Message' }]);
      expect(component.errors).toEqual([{ test: 'Message' }]);
    });

    it('should set the courtCentre selected', () => {
      component.onSelectCourtCentre({ value: courtCentresMock[0].id });
      expect(component.selectedCourtCentre).toEqual(courtCentresMock[0]);
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();

      component.onSelectCourtCentre({ value: '', type: 'change' });
      expect(component.selectedCourtCentre).toEqual(undefined);
    });

    it('should submit the correct values for crown or magistrate court selection', () => {
      const selectedOptions = {
        courtCentreId: '1234',
        courtRoomId: '',
        startDate: '2018-10-05',
        endDate: '2018-10-05',
        isCrownCourt: true,
        courtCentre: 'Liverpool Crown'
      };

      component.filterSubmit(selectedOptions);
      expect(component.crownCourtSelected).toBeTruthy();

      expect(dispatchSpy).toHaveBeenLastCalledWith(
        searchAllocatedHearingsForPrisonListAction({ options: { ...selectedOptions } })
      );
    });
  });
});

export class TestActions extends Actions {
  constructor() {
    super(EMPTY);
  }

  set stream(source: Observable<any>) {
    this.source = source;
  }
}
