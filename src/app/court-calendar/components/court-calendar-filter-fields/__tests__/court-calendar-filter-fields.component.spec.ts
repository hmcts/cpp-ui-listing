import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourtCalendarFilterFieldsComponent } from '../court-calendar-filter-fields.component';
import { reducers } from '../../../../core/reducers';
import { provideStore } from '@ngrx/store';

describe('CourtCalendarFilterFieldsComponent', () => {
  let component: CourtCalendarFilterFieldsComponent;
  let fixture: ComponentFixture<CourtCalendarFilterFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} })]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtCalendarFilterFieldsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('courtType', 'MAGISTRATES');
  });

  it('should return true if date is after two weeks from the start date', () => {
    const startDate = new Date().toISOString();
    const disabledDate = new Date();
    disabledDate.setDate(disabledDate.getDate() + 15); // 15 days ahead

    const result = component.disabledEndDate(startDate)(disabledDate);

    expect(result).toBeTruthy();
  });

  it('should return false if date is within two weeks from the start date', () => {
    const startDate = new Date().toISOString();
    const enabledDate = new Date();
    enabledDate.setDate(enabledDate.getDate() + 5); // 5 days ahead

    const result = component.disabledEndDate(startDate)(enabledDate);

    expect(result).toBeFalsy();
  });
});
