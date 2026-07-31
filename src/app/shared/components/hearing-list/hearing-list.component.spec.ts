import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConfigService } from '../../../config';
import { HearingListComponent } from './hearing-list.component';
import { WofdWarningService } from '@cpp/application';

const mockData = require('./test-mock-data.json');
@Component({
  template: `
    <hearing-list
      [hearings]="hearings"
      [pageSize]="pageSize"
      [totalResults]="totalResults"
      [pageNumber]="pageNumber"
      [hideActionColumn]="hideActionColumn"
    >
    </hearing-list>
  `,
  imports: [HearingListComponent],
  providers: [
    { provide: AppConfigService, useValue: { appUrl: 'test' } },
    {
      provide: WofdWarningService,
      useValue: { isWofdApplication: () => false, showModal: () => {} }
    }
  ]
})
class TestHostComponent {
  hearings = mockData;
  pageSize: number;
  totalResults: number;
  pageNumber: number;
  hideActionColumn = false;
}

describe('HearingListComponent', () => {
  let component: HearingListComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create the right templates with actions', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should create the right templates without actions', () => {
    hostComponent.hideActionColumn = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render the standalone application details', () => {
    const hearing = mockData[2];
    expect(component.isStandaloneApplication(hearing)).toBe(true);
    expect(component.getStandaloneApplicantName(hearing.courtApplications[0])).toEqual(
      'TEST FIRST TEST LAST'
    );
    expect(component.getStandaloneRespondentNames(hearing.courtApplications[0])).toEqual([
      'PARTY FIRST NAME PARTY LAST NAME'
    ]);
  });

  it('should return the earliest custody time', () => {
    const defendants = mockData[0].listedCases[0].defendants;
    expect(component.defendantEarliestCustodyTimeLimit(defendants)).toBe(
      '2019-04-20T00:00:00.000Z'
    );
  });

  it('should return bail status - In custody', () => {
    const defendants = mockData[1].listedCases[0].defendants;
    expect(component.firstDefendantBailStatus(defendants)).toBe('In custody');
  });

  it('should return bail status - Default', () => {
    const defendants = mockData[1].listedCases[0].defendants;
    defendants[0].bailStatus = undefined;
    expect(component.firstDefendantBailStatus(defendants)).toBe('');
  });

  it('should check if hearing has multiple listed cases', () => {
    expect(component.isHearingWithMultipleCases(mockData[0])).toBeTruthy();
  });

  it('should check if cell does not have a border bottom', () => {
    expect(component.isCellWithDottedBorderBottom(mockData[0], 0)).toBeTruthy();
  });

  it('should return kase.caseIdentifier.authorityCode as prosecutor', () => {
    const kase = mockData[0].listedCases[0];
    expect(component.getProsecutor(kase)).toBe('CPS');
  });

  it('should return kase.prosecutor.prosecutorCode as prosecutor', () => {
    const kases = mockData[0].listedCases;
    kases[0]['prosecutor'] = {
      prosecutorCode: 'Prosecutor populated'
    };
    expect(component.getProsecutor(kases[0])).toBe('Prosecutor populated');
  });

  describe('Pagination', () => {
    it('should display pagination if total results are more than page size', async () => {
      ((hostComponent.pageSize = 1),
        (hostComponent.totalResults = 2),
        (hostComponent.pageNumber = 1));

      fixture.detectChanges();
      await fixture.whenRenderingDone();

      expect(fixture).toMatchSnapshot();
    });

    it('should not display pagination if total results are equal to page size', async () => {
      ((hostComponent.pageSize = 2),
        (hostComponent.totalResults = 2),
        (hostComponent.pageNumber = 1));

      fixture.detectChanges();
      await fixture.whenRenderingDone();

      expect(fixture).toMatchSnapshot();
    });

    it('should emit page number if pageChange occurs', () => {
      const spyPageChange = spyOn(component.pageNumber, 'set');
      component.pageChanged(2);

      expect(spyPageChange).toHaveBeenCalledWith(2);
    });

    it('should display the current page with expected cases ', async () => {
      ((hostComponent.pageSize = 1),
        (hostComponent.totalResults = 2),
        (hostComponent.pageNumber = 1));

      fixture.detectChanges();
      await fixture.whenRenderingDone();

      expect(fixture).toMatchSnapshot();
    });
  });
});
