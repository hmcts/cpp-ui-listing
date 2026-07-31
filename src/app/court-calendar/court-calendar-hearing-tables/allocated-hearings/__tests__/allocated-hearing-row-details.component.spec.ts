import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllocatedHearingRowDetailsComponent } from '../allocated-hearing-row-details/allocated-hearing-row-details.component';

describe('AllocatedHearingRowDetailsComponent', () => {
  let component: AllocatedHearingRowDetailsComponent;
  let fixture: ComponentFixture<AllocatedHearingRowDetailsComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocatedHearingRowDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
