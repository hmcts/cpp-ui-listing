import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as mockData from './test-mock-data.json';
import { HearingSummaryComponent } from './hearing-summary.component';

@Component({
  template: ` <hearing-summary [hearing]="hearing"> </hearing-summary> `,
  imports: [HearingSummaryComponent]
})
class TestHostComponent {
  hearing = mockData;
}

describe('HearingSummaryComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should match Jest spapshot', () => {
    expect(fixture).toMatchSnapshot();
  });
});
