import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Defendant, Offence } from '../../../core/model';
import { AppConfigService } from '../../../config';
import { ReportingRestrictionsComponent } from './reporting-restrictions.component';

describe('Reporting Restrictions Component', () => {
  let fixture: ComponentFixture<TestReportingRestrictionsComponent>;
  let componentInstance: TestReportingRestrictionsComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestReportingRestrictionsComponent);
    componentInstance = fixture.componentInstance;
  });

  it('should render when no reporting restrictions are present', () => {
    componentInstance.defendants = null;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
    componentInstance.defendants = [];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  describe('when reporting restrictions are present', () => {
    beforeEach(() => {
      componentInstance.defendants = [
        {
          offences: [
            {
              reportingRestrictions: [
                {
                  id: 'rr'
                }
              ]
            }
          ] as Offence[]
        } as Defendant
      ];
      fixture.detectChanges();
    });

    it('should render correctly when no case id is provided', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should render correctly when case id is provided', () => {
      componentInstance.caseId = 'case123';
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should render correctly in active mode', () => {
      componentInstance.isActive = true;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should render correctly in warning mode', () => {
      componentInstance.isWarning = true;
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });
});

@Component({
  selector: 'test-reporting-restrictions',
  template: `
    <reporting-restrictions
      [caseId]="caseId"
      [defendants]="defendants"
      [isActive]="isActive"
      [isWarning]="isWarning"
    >
    </reporting-restrictions>
  `,
  imports: [ReportingRestrictionsComponent],
  providers: [
    {
      provide: AppConfigService,
      useValue: {
        appUrl: 'http://app/url'
      }
    }
  ]
})
class TestReportingRestrictionsComponent {
  caseId: string;
  isActive: boolean;
  isWarning: boolean;
  defendants: Defendant[];
}
