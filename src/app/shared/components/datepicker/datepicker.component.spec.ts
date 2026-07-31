import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { DatePickerComponent } from './datepicker.component';

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: DatePickerComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].query(By.css('date-picker')).componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should render correctly after selecting the right date', () => {
    component.onValueChange('2018-01-01');
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});

@Component({
  template: `
    <form>
      <date-picker
        name="startDate"
        [id]="'startDate'"
        [aria-describedby]="'date'"
        ngModel
      ></date-picker>
      <form></form>
    </form>
  `,
  imports: [DatePickerComponent, FormsModule]
})
class TestHostComponent {}
