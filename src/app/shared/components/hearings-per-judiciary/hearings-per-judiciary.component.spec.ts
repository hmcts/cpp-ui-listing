import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HearingType, JudicialMemberNamePipe } from '@cpp/reference-data';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock4,
  validHearingMultipleStandaloneApplicationsMock,
  validHearingSingleLinkedApplicationMock,
  validHearingSingleStandaloneApplicationMock
} from '../../../../mock-data/test-fixtures';
import { AppConfigService } from '../../../config';
import { CourtRestrictionEventType } from '../../../core/model/court-restriction';
import { HearingsPerJudiciaryComponent } from './hearings-per-judiciary.component';
import { provideStore } from '@ngrx/store';
import { CourtroomsFilter, reducers } from '../../../core';

@Component({
  template: `
    <hearings-per-judiciary
      [judiciary]="judiciary"
      [hearings]="hearings"
      [enableAction]="enableAction"
      [latestSelection]="hearing1"
      [selectedDate]="selectedDate"
      [preSelectedHearing]="hearing1"
      [restrictLists]="restrictLists"
      [restrictedCourtHearingSelected]="restrictedCourtHearingSelected"
      [enableAction]="enableAction"
      [hearingTypes]="hearingTypes"
      [weekCommencingSelected]="weekCommencingSelected"
      (onHearingSelected)="hearingSelected($event)"
    >
    </hearings-per-judiciary>
  `,
  imports: [HearingsPerJudiciaryComponent],
  providers: [
    JudicialMemberNamePipe,
    { provide: AppConfigService, useValue: { appUrl: 'http://baseUrl' } }
  ]
})
class TestHostComponent {
  hearing1 = validHearingMock1;
  hearing2 = validHearingMock2;
  hearings = [validHearingSingleStandaloneApplicationMock];
  judiciary = this.hearing1.judiciary;
  selectedDate = '2018-11-05';
  restrictLists = false;
  enableAction = false;
  hearingTypes: HearingType[] = [];
  hearingSelected = jest.fn();
  restrictedCourtHearingSelected = null;
  weekCommencingSelected: boolean;
  filterOptions: CourtroomsFilter;
}
describe('HearingsPerJudiciaryComponent', () => {
  describe('Wrapped', () => {
    let hostComponent: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideStore(reducers, { runtimeChecks: {} })]
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      hostComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    it('should match Jest snapshot for hearing with listedCase', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should display number of cases and defendants for a hearing containing a bulk case', () => {
      hostComponent.hearings = [
        {
          ...validHearingMock1,
          totalCases: 1000,
          listedCases: [{ ...validHearingMock1.listedCases[0], isGroupMaster: true }]
        }
      ];
      fixture.detectChanges();

      const numberOfDefendants = fixture.debugElement.query(
        By.css('div[data-test-id="numberOfDefendants"]')
      ).nativeElement;
      const numberOfCases = fixture.debugElement.query(
        By.css('div[data-test-id="numberOfCases"]')
      ).nativeElement;

      expect(numberOfDefendants.textContent.trim()).toBe('1000 DEFENDANTS');
      expect(numberOfCases.textContent.trim()).toBe('1000 CASES');
    });

    it('should match Jest snapshot for hearing without public list note', () => {
      hostComponent.hearings = [validHearingMock1];
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should match Jest snapshot for hearing with public list note', () => {
      hostComponent.hearings = [validHearingMock2];
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should match Jest snapshot for hearing with CourtApplication and linked ListedCase', () => {
      hostComponent.hearings = [validHearingSingleLinkedApplicationMock];
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should match Jest snapshot for hearing with one standalone CourtApplication', () => {
      hostComponent.hearings = [validHearingSingleStandaloneApplicationMock];
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });

    it('should match Jest snapshot for hearing with multiple standalone CourtApplication', () => {
      hostComponent.hearings = [validHearingMultipleStandaloneApplicationsMock];
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should select the hearing and then clear the selected hearing', () => {
      const component: HearingsPerJudiciaryComponent =
        fixture.debugElement.children[0].componentInstance;
      hostComponent.enableAction = true;
      component.hearingSelected(validHearingMock1);
      expect(component.selectedHearing).toEqual(validHearingMock1);

      component.clearSelectedHearing();

      expect(component.selectedHearing).toEqual(undefined);
    });

    it('should show restrict list link when restrict lists is true', () => {
      hostComponent.restrictLists = true;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should show open state of rectricted row with restricted being populated', () => {
      hostComponent.restrictLists = true;
      hostComponent.hearings = [validHearingSingleStandaloneApplicationMock];
      hostComponent.restrictedCourtHearingSelected = validHearingSingleStandaloneApplicationMock;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should populate youth flag', () => {
      hostComponent.hearings = [validHearingMock2];
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should check if cell has dotted border bottom', () => {
      const component: HearingsPerJudiciaryComponent =
        fixture.debugElement.children[0].componentInstance;
      hostComponent.hearings = [validHearingMock2];
      fixture.detectChanges();
      expect(component.isCellWithDottedBorderBottom(validHearingMock2, 0)).toBeFalsy();
    });

    it('should check if cell should show the estimate time', () => {
      const component: HearingsPerJudiciaryComponent =
        fixture.debugElement.children[0].componentInstance;
      hostComponent.hearings = [validHearingMock2];
      fixture.detectChanges();
      expect(component.showEstimateTime(validHearingMock2, 0)).toBeTruthy();
    });

    describe('should return correct duration minutes', () => {
      it('when weekCommencingSelected is true', () => {
        const hearingTypes: HearingType[] = [
          {
            id: '5591d709-4397-452c-8533-998165d58d9c',
            seqId: 1234,
            hearingCode: '123',
            hearingDescription: 'Further Plea & Trial Preparation',
            welshHearingDescription: 'welshdes',
            defaultDurationMin: 10
          }
        ];
        const component: HearingsPerJudiciaryComponent =
          fixture.debugElement.children[0].componentInstance;
        hostComponent.hearingTypes = hearingTypes;
        hostComponent.weekCommencingSelected = true;
        fixture.detectChanges();
        expect(component.getHearingEstimate(validHearingMock4)).toBe(10);
      });

      it('when weekCommencingSelected is false without filterOptions', () => {
        const component: HearingsPerJudiciaryComponent =
          fixture.debugElement.children[0].componentInstance;
        hostComponent.weekCommencingSelected = undefined;
        hostComponent.selectedDate = '2018-11-05';
        fixture.detectChanges();
        expect(component.getHearingEstimate(validHearingMock1)).toBe(120);
      });

      it('when weekCommencingSelected is false with filterOptions', () => {
        const component: HearingsPerJudiciaryComponent =
          fixture.debugElement.children[0].componentInstance;
        hostComponent.weekCommencingSelected = undefined;
        hostComponent.filterOptions = {
          courtCentreId: null,
          courtRoomId: null,
          searchDate: '2018-11-05'
        };
        fixture.detectChanges();
        expect(component.getHearingEstimate(validHearingMock1)).toBe(120);
      });
    });
  });

  describe('Standalone', () => {
    let component: HearingsPerJudiciaryComponent;
    let fixture: ComponentFixture<HearingsPerJudiciaryComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [JudicialMemberNamePipe]
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(HearingsPerJudiciaryComponent);
      component = fixture.debugElement.componentInstance;
    });

    it('should emit court restriction for case', () => {
      spyOn(component.onRestrictionChanged, 'emit').and.callThrough();
      component.onRestrictCaseChanged('1234', validHearingMock1.id, true);
      expect(component.onRestrictionChanged.emit).toHaveBeenCalledTimes(1);
      expect(component.onRestrictionChanged.emit).toHaveBeenLastCalledWith({
        caseIds: ['1234'],
        restrictCourtList: true,
        hearingId: validHearingMock1.id
      });
    });

    it('should emit court restriction for defendant', () => {
      spyOn(component.onRestrictionChanged, 'emit').and.callThrough();
      const restriction = {
        restrictionEventType: CourtRestrictionEventType.Defendant,
        defendantIds: ['1234'],
        hearingId: validHearingMock1.id,
        restrictCourtList: true
      };
      component.onRestrictPartyChanged(restriction);
      expect(component.onRestrictionChanged.emit).toHaveBeenCalledTimes(1);
      expect(component.onRestrictionChanged.emit).toHaveBeenLastCalledWith({
        defendantIds: restriction.defendantIds,
        restrictCourtList: true,
        hearingId: validHearingMock1.id
      });
    });

    it('should emit court restriction for subject', () => {
      spyOn(component.onRestrictionChanged, 'emit').and.callThrough();
      const restriction = {
        restrictionEventType: CourtRestrictionEventType.SUBJECT,
        courtApplicationSubjectIds: ['1234'],
        hearingId: validHearingMock1.id,
        restrictCourtList: true
      };
      component.onRestrictPartyChanged(restriction);
      expect(component.onRestrictionChanged.emit).toHaveBeenCalledTimes(1);
      expect(component.onRestrictionChanged.emit).toHaveBeenLastCalledWith({
        courtApplicationSubjectIds: restriction.courtApplicationSubjectIds,
        restrictCourtList: true,
        hearingId: validHearingMock1.id
      });
    });

    it('should emit court restriction when case restriction changes', () => {
      spyOn(component.onRestrictionChanged, 'emit').and.callThrough();
      component.onRestrictCaseChanged('12345', 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42', true);
      expect(component.onRestrictionChanged.emit).toHaveBeenCalledTimes(1);
      expect(component.onRestrictionChanged.emit).toHaveBeenCalledWith({
        caseIds: ['12345'],
        hearingId: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
        restrictCourtList: true
      });
    });

    describe('onApplicationClick', () => {
      const mockHearing = {
        ...validHearingSingleStandaloneApplicationMock,
        courtApplications: [
          {
            id: 'app-123',
            applicationTypeCode: 'WOFD_CODE',
            applicationReference: 'REF-001'
          }
        ]
      } as any;

      it('should call preventDefault to stop default link navigation', () => {
        const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any;
        component.onApplicationClick(event, mockHearing);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should call stopPropagation to prevent the click from bubbling to the parent row', () => {
        const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any;
        component.onApplicationClick(event, mockHearing);
        expect(event.stopPropagation).toHaveBeenCalled();
      });

      it('should emit onApplicationLinkClick with the applicationId and applicationTypeCode from the first court application', () => {
        spyOn(component.onApplicationLinkClick, 'emit').and.callThrough();
        const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() } as any;
        component.onApplicationClick(event, mockHearing);
        expect(component.onApplicationLinkClick.emit).toHaveBeenCalledWith({
          applicationId: 'app-123',
          applicationTypeCode: 'WOFD_CODE'
        });
      });
    });
  });
});
