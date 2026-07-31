import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnscheduledListingsTableComponent } from './unscheduled-listings-table.component';
import { hearings } from '../../../core/services/listing/mocks';
import { mockResultTwo } from '../../mock-data/mock-data';
import { mockFixtureInputs } from '../../../../mock-data/mock-fixture-inputs';

const mockData = require('./test-mock-data.json');

describe('UnscheduledListingsTableComponent', () => {
  let component: UnscheduledListingsTableComponent;
  let fixture: ComponentFixture<UnscheduledListingsTableComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UnscheduledListingsTableComponent);
    component = fixture.componentInstance;
  });

  it('should create the right templates with actions', () => {
    mockFixtureInputs(fixture, {
      unscheduledHearings: mockData
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should create the right templates with pagination', () => {
    mockFixtureInputs(fixture, {
      unscheduledHearings: mockData,
      totalResults: 10,
      pageSize: 5,
      pageNumber: 1
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should create the right templates without actions', () => {
    mockFixtureInputs(fixture, {
      unscheduledHearings: mockData
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should show unscheduled hearings for applications', () => {
    mockFixtureInputs(fixture, {
      unscheduledHearingsForApplications: mockResultTwo
    });
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should allocate hearing', () => {
    mockFixtureInputs(fixture, {
      unscheduledHearings: mockData
    });
    spyOn(component.onAllocate, 'emit');
    component.allocate(hearings[0]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
    expect(component.onAllocate.emit).toHaveBeenCalledTimes(1);
  });

  it('should change page', () => {
    mockFixtureInputs(fixture, {
      unscheduledHearings: mockData
    });
    spyOn(component.pageNumber, 'set');
    component.pageChanged(2);
    fixture.detectChanges();
    expect(component.pageNumber.set).toHaveBeenCalledTimes(1);
  });
});
