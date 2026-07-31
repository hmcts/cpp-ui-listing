import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { DateRangeComponent } from './date-range.component';
import { UntypedFormControl, NgForm, FormsModule } from '@angular/forms';
import { DateRange } from './date-range';
import { PdkForm } from '@cpp/pdk';

@Component({
  selector: 'test-date-range-input',
  template: `
    <form pdk-form>
      <listing-date-range
        aria-describedby="identifier"
        id="dateRange"
        name="dateRange"
        [ngModel]="dateRange"
        (onIsMultiDay)="testMethod($event)"
        hearing="hearing"
      >
      </listing-date-range>
    </form>
  `,
  imports: [DateRangeComponent, PdkForm, FormsModule]
})
class TestHostComponent {
  dateRange = new DateRange('2018-03-15', '2018-03-16');

  testMethod() {}
}

@Component({
  template: `Home`
})
class HomeComponent {}

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
];

describe('DateRangeComponent', () => {
  let dateRange: UntypedFormControl;
  let form: NgForm;
  let component: DateRangeComponent;
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let startDateDayInput: DebugElement;
  let startDateMonthInput: DebugElement;
  let startDateYearInput: DebugElement;
  let endDateDayInput: DebugElement;
  let endDateMonthInput: DebugElement;
  let endDateYearInput: DebugElement;
  let dateRangeElement: DebugElement;
  let multiDayCheckbox: DebugElement;

  function setMultiDay(isMultiday: boolean) {
    component.isMultiday = isMultiday;
  }

  function dispatchMultiDayChange() {
    multiDayCheckbox.nativeElement.dispatchEvent(new Event('change'));
  }

  function setDateRangeValues(
    startDate: { day?: string; month?: string; year?: string },
    endDate: { day?: string; month?: string; year?: string }
  ) {
    setStartDate(startDate);
    fixture.detectChanges();
    tick(100);
    setEndDate(endDate);
    fixture.detectChanges();
    tick(100);
  }

  function setStartDate(startDate: { day?: string; month?: string; year?: string }) {
    startDateDayInput.nativeElement.value = startDate.day;
    startDateDayInput.nativeElement.dispatchEvent(new Event('input'));
    startDateMonthInput.nativeElement.value = startDate.month;
    startDateMonthInput.nativeElement.dispatchEvent(new Event('input'));
    startDateYearInput.nativeElement.value = startDate.year;
    startDateYearInput.nativeElement.dispatchEvent(new Event('input'));
  }

  function setEndDate(endDate: { day?: string; month?: string; year?: string }) {
    endDateDayInput.nativeElement.value = endDate.day;
    endDateDayInput.nativeElement.dispatchEvent(new Event('input'));
    endDateMonthInput.nativeElement.value = endDate.month;
    endDateMonthInput.nativeElement.dispatchEvent(new Event('input'));
    endDateYearInput.nativeElement.value = endDate.year;
    endDateYearInput.nativeElement.dispatchEvent(new Event('input'));
  }

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }, provideRouter(routes)],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].children[0].componentInstance;
    testHostComponent = fixture.debugElement.componentInstance;

    fixture.detectChanges();
    tick();

    form = fixture.debugElement.children[0].injector.get(NgForm);
    dateRange = form.control.get('dateRange') as UntypedFormControl;
    dateRangeElement = fixture.debugElement.query(By.css('[aria-describedby]'));
    startDateDayInput = fixture.debugElement.query(By.css('[name=startDate] [name=dateDay]'));
    startDateMonthInput = fixture.debugElement.query(By.css('[name=startDate] [name=dateMonth]'));
    startDateYearInput = fixture.debugElement.query(By.css('[name=startDate] [name=dateYear]'));
    endDateDayInput = fixture.debugElement.query(By.css('[name=endDate] [name=dateDay]'));
    endDateMonthInput = fixture.debugElement.query(By.css('[name=endDate] [name=dateMonth]'));
    endDateYearInput = fixture.debugElement.query(By.css('[name=endDate] [name=dateYear]'));
    multiDayCheckbox = fixture.debugElement.query(By.css('[name=multiDay] input'));
  }));

  it('should create', () => {
    spyOn(component.onIsMultiDay, 'emit');

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(component).toBeTruthy();
  });

  it('should show component fields for date range component', () => {
    spyOn(component.onIsMultiDay, 'emit');

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(fixture).toMatchSnapshot();
  });

  it('constructs a DateRange from the entered parts', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setMultiDay(true);
    setDateRangeValues(
      { day: '15', month: '05', year: '2018' },
      { day: '16', month: '05', year: '2018' }
    );
    tick();

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(1);
    expect(dateRange.value).toEqual(new DateRange('2018-05-15', '2018-05-16'));
  }));

  it('applies the aria-describedby attribute to the component', () => {
    expect(dateRangeElement.nativeElement.getAttribute('aria-describedby')).toEqual('identifier');
  });

  it('raises a `endDateBeforeStartDate` when the start date is after the end date', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    expect(form.valid).toBe(true);
    setDateRangeValues(
      { day: '15', month: '07', year: '2018' },
      { day: '15', month: '05', year: '2018' }
    );
    form.ngSubmit.emit();
    fixture.detectChanges();
    tick();

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(fixture).toMatchSnapshot();
  }));

  it('raises a `dateRangeExceeded` when the difference between the start date and end date exceeds 2 years', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    expect(form.valid).toBe(true);
    setDateRangeValues(
      { day: '15', month: '07', year: '2018' },
      { day: '16', month: '07', year: '2020' }
    );
    form.ngSubmit.emit();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(fixture).toMatchSnapshot();
  }));

  it('validates that the start date can be before the end date', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    expect(form.valid).toBe(true);
    setDateRangeValues(
      { day: '15', month: '05', year: '2018' },
      { day: '15', month: '07', year: '2018' }
    );
    form.ngSubmit.emit();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(form.control.getError('endDate', ['dateRange'])).toBeNull();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(fixture).toMatchSnapshot();
  }));

  it('Validates that the start date cannot be the same as the end date.', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    expect(form.valid).toBe(true);
    setDateRangeValues(
      { day: '15', month: '07', year: '2018' },
      { day: '16', month: '07', year: '2018' }
    );
    form.ngSubmit.emit();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(form.control.getError('endDate', ['dateRange'])).toBeNull();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(fixture).toMatchSnapshot();
  }));

  it('End date control not initially visible when end date is same as start date', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    testHostComponent.dateRange = new DateRange('2018-07-15', '2018-07-16');
    fixture.detectChanges();
    tick();

    expect(fixture).toMatchSnapshot();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(1);
    expect(dateRange.value).toEqual(new DateRange('2018-07-15', '2018-07-16'));
  }));

  //
  it('End date control visible when end date is after start date', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setDateRangeValues(
      { day: '15', month: '07', year: '2018' },
      { day: '20', month: '07', year: '2018' }
    );
    fixture.detectChanges();
    tick();

    expect(fixture).toMatchSnapshot();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(dateRange.value).toEqual(new DateRange('2018-07-15', '2018-07-20'));
  }));

  it('sets the end to be equal to the start date when the end date is not supplied', fakeAsync(() => {
    multiDayCheckbox.nativeElement.click();
    spyOn(component.onIsMultiDay, 'emit');
    setDateRangeValues({ day: '15', month: '07', year: '2018' }, { day: '', month: '', year: '' });
    tick();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(0);
    expect(dateRange.value).toEqual(new DateRange('2018-07-15', '2018-07-15'));
  }));

  it('sets the end to be equal to the start date when multi checkbox is unchecked', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setDateRangeValues(
      { day: '15', month: '07', year: '2018' },
      { day: '20', month: '07', year: '2018' }
    );
    dispatchMultiDayChange();
    tick();
    expect(dateRange.value).toEqual(new DateRange('2018-07-15', '2018-07-15'));
  }));

  it('end date moves forward the same number of days as the start date moves into future', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setMultiDay(true);
    fixture.detectChanges();
    startDateDayInput.nativeElement.value = '20';
    startDateDayInput.nativeElement.dispatchEvent(new Event('input'));
    startDateDayInput.nativeElement.dispatchEvent(new Event('blur'));
    tick();

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(1);
    expect(dateRange.value).toEqual(new DateRange('2018-03-20', '2018-03-21'));
  }));

  it('end date moves back the same number of days if multi day and start date is moved backwards', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setMultiDay(true);
    fixture.detectChanges();
    startDateDayInput.nativeElement.value = '10';
    startDateDayInput.nativeElement.dispatchEvent(new Event('input'));
    startDateDayInput.nativeElement.dispatchEvent(new Event('blur'));
    tick();

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(1);
    expect(dateRange.value).toEqual(new DateRange('2018-03-10', '2018-03-11'));
  }));

  it('end date moves back with start date if not multi day and start date is moved back', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setMultiDay(false);
    fixture.detectChanges();
    tick();
    expect(dateRange.value).toEqual(new DateRange('2018-03-15', '2018-03-16'));
    setStartDate({ day: '01', month: '03', year: '2018' });
    tick();
    expect(dateRange.value).toEqual(new DateRange('2018-03-01', '2018-03-01'));
  }));

  it('onIsMultiDay event is raised twice when checkbox in clicked twice', fakeAsync(() => {
    spyOn(component.onIsMultiDay, 'emit');
    setMultiDay(true);

    dispatchMultiDayChange();
    tick();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledWith(false);
    dispatchMultiDayChange();
    tick();
    expect(component.onIsMultiDay.emit).toHaveBeenCalledWith(true);

    expect(component.onIsMultiDay.emit).toHaveBeenCalledTimes(3);
  }));

  it('should set the end date to the same as startDate if date range given as input has endDate before startDate ', fakeAsync(() => {
    testHostComponent.dateRange = new DateRange('2018-03-15', '2018-03-10');
    fixture.detectChanges();
    tick();
    expect(dateRange.value).toEqual(new DateRange('2018-03-15', '2018-03-15'));
  }));
});
