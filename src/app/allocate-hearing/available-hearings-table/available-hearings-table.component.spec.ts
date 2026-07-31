import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AvailableHearingsTableComponent } from './available-hearings-table.component';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock3,
  courtCentresMock
} from '../../../mock-data/test-fixtures';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { SchedulingState } from '@cpp/scheduling';
import { provideMockStore } from '@ngrx/store/testing';
import { mockFixtureInputs } from '../../../mock-data/mock-fixture-inputs';

describe('AvailableHearingsTableComponent', () => {
  let component: AvailableHearingsTableComponent;
  let fixture: ComponentFixture<AvailableHearingsTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Location, useValue: of(undefined) },
        provideMockStore({
          initialState: {
            scheduling: {
              listingNotes: {
                notes: []
              }
            }
          } as SchedulingState
        })
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableHearingsTableComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      hearings: [validHearingMock1, validHearingMock2, validHearingMock3],
      courtCentres: courtCentresMock
    });
    fixture.detectChanges();
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('#getCourtCentreName', () => {
    expect(component.getCourtCentreName(courtCentresMock[0].id)).toBe('Liverpool Crown Court');
  });

  it('#getCourtRoomName', () => {
    expect(
      component.getCourtRoomName(courtCentresMock[0].id, courtCentresMock[0].courtRooms[0].id)
    ).toBe('Courtroom 3-1');
  });

  it('#formatHearingType', () => {
    expect(component.formatHearingType(validHearingMock1.type)).toBe(
      'Further plea & trial preparation'
    );
  });

  it('#viewHearingDetails', () => {
    spyOn(component.onViewHearingDetails, 'emit');
    component.viewHearingDetails(validHearingMock1);
    fixture.detectChanges();
    expect(component.onViewHearingDetails.emit).toHaveBeenCalledWith(validHearingMock1);
  });

  it('#extendHearingForHearing', () => {
    spyOn(component.onExtendHearingForHearing, 'emit');
    component.selectedHearingId = 'test-hearing-id';
    component.sendNotificationToParties = true;
    component.extendHearingForHearing();
    fixture.detectChanges();
    expect(component.onExtendHearingForHearing.emit).toHaveBeenCalledWith({
      selectedHearingId: 'test-hearing-id',
      sendNotificationToParties: true
    });
  });
});
