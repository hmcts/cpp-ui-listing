import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock3
} from '../../../mock-data/test-fixtures';
import { CourtroomsFilter } from '../../core';
import { TotalListingHoursComponent } from './total-listing-hours.component';

@Component({
  template: `
    <total-listing-hours [hearings]="selectedHearings" [filterOptions]="filterOptions">
    </total-listing-hours>
  `,
  imports: [TotalListingHoursComponent]
})
class TestHostComponent {
  selectedHearings = [validHearingMock1];
  filterOptions: CourtroomsFilter = {
    courtCentreId: '1',
    courtRoomId: '2',
    searchDate: '2018-11-05'
  };
}
describe('TotalListingHoursComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should display the expected template when no startTime or endtime is passed', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display the expected template when filter options are passed', () => {
    fixture.componentInstance.filterOptions.startTime = '10:00';
    fixture.componentInstance.filterOptions.endTime = '17:00';
    fixture.componentInstance.selectedHearings = [
      validHearingMock2,
      validHearingMock1,
      validHearingMock3
    ];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
