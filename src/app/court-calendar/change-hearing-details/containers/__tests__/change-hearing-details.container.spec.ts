import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonPipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import {
  ChangeHearingDetailsComponent,
  ChangeHearingDetailsFormValues
} from '../../components/change-hearing-details.component';
import { Hearing, HearingWithSelectedCourtCentre } from '../../../../core';
import { HearingSlot } from '@cpp/scheduling';
import { ChangehearingDetailsContainer } from '../change-hearing-details.container';
import { preparedPayload, selectedHearing } from '../../../utils/mocks';
import { CourtCalendarActions } from '../../../state';
import { Router } from '@angular/router';
import { ValidationErrors } from '@angular/forms';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';
import { ChangeHearingDetailsStore } from '../../component-store/change-hearing-details.store';

class MockChangeHearingDetailsStore {
  startDateSessions = signal<HearingSlot[]>([]);
}

describe('ChangeHearingDetailsContainer', () => {
  let fixture: ComponentFixture<ChangehearingDetailsContainer>;
  let component: ChangehearingDetailsContainer;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let navigate: jest.Mock;
  const initialState = {
    courtCalendar: {
      selectedHearing: selectedHearing
    },
    scheduling: {
      allocation: {
        hearingSlots: [],
        totalResults: 0,
        params: null
      }
    }
  };

  beforeEach(() => {
    navigate = jest.fn();
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      providers: [
        provideMockStore({ initialState }),
        {
          provide: Router,
          useValue: {
            navigate
          }
        }
      ]
    })
      .overrideComponent(ChangehearingDetailsContainer, {
        remove: {
          imports: [ChangeHearingDetailsComponent, BackButtonComponent],
          providers: [ChangeHearingDetailsStore]
        },
        add: {
          imports: [MockChangeHearingDetailsComponent, MockBackButtonComponent],
          providers: [
            { provide: ChangeHearingDetailsStore, useClass: MockChangeHearingDetailsStore }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChangehearingDetailsContainer);
    component = fixture.componentInstance;

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    store.setState(initialState);
    fixture.detectChanges();
  });

  it('should create the change hearing details container', () => {
    expect(component).toBeTruthy();
  });

  it('should pass only the start date sessions to the change hearing details form', () => {
    const startDateSessions = [
      { courtScheduleId: 'nth-12', sessionDate: '2026-10-12' } as HearingSlot
    ];
    (
      component.changeHearingDetailsStore as unknown as MockChangeHearingDetailsStore
    ).startDateSessions.set(startDateSessions);
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.directive(MockChangeHearingDetailsComponent))
      .componentInstance as MockChangeHearingDetailsComponent;
    expect(form.hearingSlots()).toEqual(startDateSessions);
  });

  it('should dispatch action on update hearing details', async () => {
    let selectedHearingData = selectedHearing as Hearing;
    let preparedPayloadData = preparedPayload as HearingWithSelectedCourtCentre;

    await component.updateHearing({
      originHearing: selectedHearingData,
      updatedHearing: preparedPayloadData
    });
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.updateSelectedHearingData({
        originHearing: selectedHearingData,
        updatedHearing: preparedPayloadData
      })
    );
  });

  it('should dispatch action on cancel hearing details', () => {
    component.cancelSelectedHearingData();
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.setSelectedHearingData({ selectedHearing: null })
    );
    expect(navigate).toHaveBeenCalledWith(['/court-calendar']);
  });

  describe('no sessions failure alert', () => {
    const failureAlert = 'There are no sessions to move this hearing';
    const setAlert = (alert: { successAlert?: string; failureAlert?: string }) => {
      store.setState({
        ...initialState,
        courtCalendar: { ...initialState.courtCalendar, ...alert }
      });
      fixture.detectChanges();
    };

    it('should show the failure alert raised by the hearing update', () => {
      setAlert({ failureAlert });

      expect(
        fixture.nativeElement.querySelector('[data-test-id="success-alert-message"]').textContent
      ).toContain(failureAlert);
    });

    it('should clear the failure alert on leaving so it does not show on the court calendar', () => {
      setAlert({ failureAlert });
      dispatchSpy.calls.reset();

      fixture.destroy();

      expect(dispatchSpy).toHaveBeenCalledWith(
        CourtCalendarActions.setAlertMessage({ failureAlert: undefined })
      );
    });

    it('should keep the success alert on leaving after a successful update', () => {
      setAlert({ successAlert: 'The hearing details have been updated' });
      dispatchSpy.calls.reset();

      fixture.destroy();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'change-hearing-details',
  template: `
    <div>{{ initialValues() | json }}</div>
    <div>{{ selectedHearing() }}</div>
    <div>{{ selectedCourtCentre() }}</div>
  `,
  standalone: true,
  imports: [JsonPipe]
})
class MockChangeHearingDetailsComponent {
  readonly initialValues = input<ChangeHearingDetailsFormValues>(undefined);
  readonly selectedHearing = input<Hearing>(undefined);
  readonly selectedCourtCentre = input(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly noSessionError = input<ValidationErrors | null>(undefined);
  readonly onSubmit = output<ChangeHearingDetailsFormValues>();
  readonly onCancel = output<void>();
  readonly onValidationError = output<any>();
}

@Component({
  selector: 'back-button',
  template: ` <div>{{ linkUrl() }}</div> `,
  standalone: true
})
class MockBackButtonComponent {
  readonly linkUrl = input<string>(undefined);
}
