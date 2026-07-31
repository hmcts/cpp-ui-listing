import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonPipe } from '@angular/common';
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

describe('ChangeHearingDetailsContainer', () => {
  let fixture: ComponentFixture<ChangehearingDetailsContainer>;
  let component: ChangehearingDetailsContainer;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let navigate: jest.Mock;
  const initialState = {
    courtCalendar: {
      selectedHearing: selectedHearing
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
          imports: [ChangeHearingDetailsComponent, BackButtonComponent]
        },
        add: {
          imports: [MockChangeHearingDetailsComponent, MockBackButtonComponent]
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
