import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { of } from 'rxjs';
import { validHearingMock1 } from '../../../../mock-data/test-fixtures';
import { AppConfigService } from '../../../config';
import { CourtRestrictionEventType } from '../../../core/model/court-restriction';
import { CourtRestrictionsComponent } from './court-restrictions.component';

@Component({
  template: `
    <court-restrictions
      (restrictPartyChanged)="hearingSelected($event)"
      [hearing]="hearing"
      [hearingType]="hearingType"
      [estimatedMinutes]="estimatedMinutes"
      [hearingTime]="hearingTime"
      [isCase]="isCase"
    >
    </court-restrictions>
  `,
  imports: [CourtRestrictionsComponent]
})
class TestHostComponent {
  defendant = validHearingMock1.listedCases[0].defendants[0];
  hearingType = validHearingMock1.type.description;
  estimatedMinutes = '20';
  hearing = validHearingMock1;
  caseIsChecked = false;
  hearingSelected = jest.fn();
  hearingTime = '13.00';
  isCase = true;
  isApplication = false;
  firstCase = false;
}
describe('CourtRestrictionsComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let courtRestrictionsComponent: CourtRestrictionsComponent;
  let courtRestrictionFixture: ComponentFixture<CourtRestrictionsComponent>;
  const select = jasmine.createSpy('select');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store,
          useValue: { select }
        },
        { provide: AppConfigService, useValue: { appUrl: 'http://baseUrl' } }
      ],
      teardown: { destroyAfterEach: false }
    });
  });

  beforeEach(() => {
    courtRestrictionFixture = TestBed.createComponent(CourtRestrictionsComponent);
    fixture = TestBed.createComponent(TestHostComponent);
    courtRestrictionsComponent = courtRestrictionFixture.componentInstance;
    hostComponent = fixture.componentInstance;
    select.and.callFake(() => of(false));
  });

  describe('Wrapped Mocked', () => {
    it('should match Jest snapshot for hearing', () => {
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should display number of defendants in bulk hearing', () => {
      hostComponent.hearing = cloneDeep(validHearingMock1);
      hostComponent.hearing.listedCases = [
        { ...hostComponent.hearing.listedCases[0], isGroupMaster: true }
      ];
      hostComponent.hearing.totalCases = 1000;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('sould display shadow listed labels on case and offence level', () => {
      select.and.callFake(() => of(true));
      hostComponent.hearing = cloneDeep(validHearingMock1);
      hostComponent.hearing.listedCases[0].shadowListed = true;
      hostComponent.hearing.listedCases[0].defendants[0].offences[0].shadowListed = true;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should display defendant checked', () => {
      select.and.callFake(() => of(true));
      validHearingMock1.listedCases[0].defendants[0].restrictFromCourtList = true;
      hostComponent.hearing = validHearingMock1;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should display Youth component when defendant is youth', () => {
      select.and.callFake(() => of(true));
      validHearingMock1.listedCases[0].defendants[0].isYouth = true;
      hostComponent.hearing = validHearingMock1;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should display defendant first offence checked', () => {
      select.and.callFake(() => of(true));
      validHearingMock1.listedCases[0].defendants[0].restrictFromCourtList = false;
      validHearingMock1.listedCases[0].defendants[0].offences.forEach(
        off => (off.restrictFromCourtList = true)
      );
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });

  describe('stand alone', () => {
    it('should check is single hearing', () => {
      courtRestrictionFixture.componentRef.setInput('hearing', validHearingMock1);
      expect(courtRestrictionsComponent.hearingIsSingleCase).toBe(true);
    });

    it('should emit court restriction for defendant', () => {
      courtRestrictionFixture.componentRef.setInput('hearing', validHearingMock1);
      spyOn(courtRestrictionsComponent.restrictPartyChanged, 'emit').and.callThrough();
      const expectedRestriction = {
        restrictionEventType: CourtRestrictionEventType.Defendant,
        defendantIds: ['1234'],
        hearingId: validHearingMock1.id,
        restrictCourtList: true
      };
      courtRestrictionsComponent.onRestrictParty(CourtRestrictionEventType.Defendant, '1234', true);
      expect(courtRestrictionsComponent.restrictPartyChanged.emit).toHaveBeenCalledTimes(1);
      expect(courtRestrictionsComponent.restrictPartyChanged.emit).toHaveBeenLastCalledWith(
        expectedRestriction
      );
    });

    it('should emit court restriction for subject', () => {
      courtRestrictionFixture.componentRef.setInput('hearing', validHearingMock1);
      spyOn(courtRestrictionsComponent.restrictPartyChanged, 'emit').and.callThrough();
      const expectedRestriction = {
        restrictionEventType: CourtRestrictionEventType.SUBJECT,
        courtApplicationSubjectIds: ['1234'],
        hearingId: validHearingMock1.id,
        restrictCourtList: true
      };
      courtRestrictionsComponent.onRestrictParty(CourtRestrictionEventType.SUBJECT, '1234', true);
      expect(courtRestrictionsComponent.restrictPartyChanged.emit).toHaveBeenCalledTimes(1);
      expect(courtRestrictionsComponent.restrictPartyChanged.emit).toHaveBeenLastCalledWith(
        expectedRestriction
      );
    });

    it('should check if cell should show the estimate time', () => {
      courtRestrictionFixture.componentRef.setInput('hearing', validHearingMock1);
      expect(courtRestrictionsComponent.showEstimateTime(validHearingMock1, 0)).toBeTruthy();
    });
  });
});
