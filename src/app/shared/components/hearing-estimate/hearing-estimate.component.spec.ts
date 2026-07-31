import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HearingEstimateComponent } from './hearing-estimate.component';

describe('HearingEstimateComponent', () => {
  let fixture: ComponentFixture<HearingEstimateComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HearingEstimateComponent);
  });

  it('The template should be generated', () => {
    fixture.componentRef.setInput('estimate', 2222);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
