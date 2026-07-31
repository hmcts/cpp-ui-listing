import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Offence } from '../../../core';
import { HearingOffencesComponent } from './hearing-offences.component';

describe('HearingOffencesComponent', () => {
  let fixture: ComponentFixture<HearingOffencesComponent>;
  let offences: Offence[];

  beforeEach(() => {
    fixture = TestBed.createComponent(HearingOffencesComponent);

    offences = [
      {
        id: '1',
        offenceCode: 'CJS24234',
        startDate: '20180-10-01',
        count: 1,
        orderIndex: 1,
        statementOfOffence: {
          title: 'Test title 2',
          legislation: 'Test legislation 2'
        }
      }
    ];
  });

  it('When number of offences is equal to One', () => {
    fixture.componentRef.setInput('offences', offences);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('When number of offences is greater than One', () => {
    const fourOffences = offences.concat(
      {
        id: '4',
        offenceCode: 'CJS24234',
        startDate: '20180-10-01',
        count: 1,
        orderIndex: 1,
        statementOfOffence: {
          title: 'Test title 4',
          legislation: 'Test legislation 4'
        }
      },
      {
        id: '5',
        offenceCode: 'CJS24234',
        startDate: '20180-10-01',
        count: 1,
        orderIndex: 1,
        statementOfOffence: {
          title: 'Test title 5',
          legislation: 'Test legislation 5'
        }
      }
    );
    fixture.componentRef.setInput('offences', fourOffences);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
