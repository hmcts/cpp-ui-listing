import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AvailableHearingsComponent } from './available-hearings.component';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock3,
  courtCentresMock
} from '../../../mock-data/test-fixtures';
import { provideMockStore } from '@ngrx/store/testing';
import { SchedulingState } from '@cpp/scheduling';
import { mockFixtureInputs } from '../../../mock-data/mock-fixture-inputs';

describe('AvailableHearingsComponent', () => {
  let component: AvailableHearingsComponent;
  let fixture: ComponentFixture<AvailableHearingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
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
    fixture = TestBed.createComponent(AvailableHearingsComponent);
    component = fixture.componentInstance;
    (mockFixtureInputs(fixture, {
      hearings: [validHearingMock1, validHearingMock2, validHearingMock3],
      courtCentres: courtCentresMock
    }),
      fixture.detectChanges());
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('#viewHearingDetails', () => {
    spyOn(component.onViewHearingDetails, 'emit');
    component.viewHearingDetails(validHearingMock1);
    fixture.detectChanges();
    expect(component.onViewHearingDetails.emit).toHaveBeenCalledWith(validHearingMock1);
  });

  it('#extendHearingForHearing', () => {
    spyOn(component.onExtendHearingForHearing, 'emit');
    component.extendHearingForHearing({
      selectedHearingId: 'test-hearing-id',
      sendNotificationToParties: true
    });
    fixture.detectChanges();
    expect(component.onExtendHearingForHearing.emit).toHaveBeenCalledWith({
      selectedHearingId: 'test-hearing-id',
      sendNotificationToParties: true
    });
  });

  describe('#isHearingWithAvailableHearings', () => {
    it('should return true and filter civil hearings when isCivil is true', () => {
      mockFixtureInputs(fixture, {
        isCivil: true,
        hearings: [
          {
            id: 'civil-filter-hearing-1',
            listedCases: [{ isCivil: true }, { isCivil: false }]
          } as any,
          {
            id: 'civil-filter-hearing-2',
            listedCases: [{ isCivil: true }]
          } as any,
          {
            id: 'civil-filter-hearing-3',
            listedCases: [{ isCivil: false }]
          } as any
        ]
      });
      fixture.detectChanges();
      const result = component.isHearingWithAvailableHearings;
      expect(result).toBeTruthy();
      expect(component.filteredHearings.length).toBe(2);
    });

    it('should return true and filter non-civil hearings when isCivil is false', () => {
      mockFixtureInputs(fixture, {
        isCivil: false,
        hearings: [
          {
            id: 'non-civil-filter-hearing-1',
            listedCases: [{}]
          } as any,
          {
            id: 'non-civil-filter-hearing-2',
            listedCases: [{ isCivil: undefined }]
          } as any,
          {
            id: 'non-civil-filter-hearing-3',
            listedCases: [{ isCivil: true }]
          } as any
        ]
      });
      fixture.detectChanges();
      const result = component.isHearingWithAvailableHearings;
      expect(result).toBeTruthy();
      expect(component.filteredHearings.length).toBe(2);
    });

    it('should return false when no valid hearings exist', () => {
      mockFixtureInputs(fixture, {
        isCivil: true,
        hearings: [
          {
            id: 'no-valid-hearing-1',
            listedCases: [{ isCivil: false }]
          } as any
        ]
      });
      fixture.detectChanges();
      const result = component.isHearingWithAvailableHearings;
      expect(result).toBeFalsy();
      expect(component.filteredHearings.length).toBe(0);
    });
  });
});
