import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustodyStatusComponent } from './custody-status.component';
import { Defendant } from '../../../../core';

describe('CustodyStatusComponent', () => {
  let component: CustodyStatusComponent;
  let fixture: ComponentFixture<CustodyStatusComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(CustodyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept custodyDefendants input', () => {
    const defendants = [
      { firstName: 'John', lastName: 'Dee', isYouth: true, bailStatus: { code: 'C' } },
      { firstName: 'Jane', lastName: 'Smith', isYouth: false, bailStatus: { code: 'B' } }
    ] as Defendant[];
    fixture.componentRef.setInput('custodyDefendants', defendants);
    fixture.detectChanges();
    expect(component.custodyDefendants()).toEqual(defendants);
  });
});
