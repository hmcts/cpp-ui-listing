import { ChangeDetectionStrategy } from '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NonSittingDaysComponent } from './non-sitting-days.component';

describe('Non sitting day component', () => {
  let component: NonSittingDaysComponent;
  let fixture: ComponentFixture<NonSittingDaysComponent>;

  beforeEach(() => {
    fixture = TestBed.overrideComponent(NonSittingDaysComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).createComponent(NonSittingDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    expect(fixture).toMatchSnapshot();
  });

  it('should add a non-sitting day', () => {
    component.formGroup.setValue({
      nonSittingDay: '2025-02-03'
    });

    component.onFormSubmit();
    fixture.detectChanges();

    expect(component.copyNonSittingDays.length).toBe(1);
    expect(component.copyNonSittingDays[0]).toContain('2025-02-03');
  });

  it('should remove a non-sitting day', () => {
    component.formGroup.setValue({
      nonSittingDay: '2025-02-03'
    });
    component.onFormSubmit();
    fixture.detectChanges();

    component.cancelNonSittingDay(0);
    fixture.detectChanges();

    expect(component.copyNonSittingDays.length).toBe(0);
  });

  it('should render in readonly mode', () => {
    fixture.componentRef.setInput('readOnly', true);
    component.copyNonSittingDays = ['2025-03-02', '2025-03-01'];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should handle form submission', () => {
    spyOn(component, 'propagateChange');

    component.formGroup.setValue({
      nonSittingDay: '2025-02-03'
    });
    component.onFormSubmit();
    fixture.detectChanges();

    component.propagateChange(component.copyNonSittingDays);
    fixture.detectChanges();

    expect(component.propagateChange).toHaveBeenCalledWith(component.copyNonSittingDays);
  });
});
