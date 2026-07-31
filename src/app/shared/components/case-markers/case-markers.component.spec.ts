import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseMarkersComponent } from './case-markers.component';
import { By } from '@angular/platform-browser';
import { ChangeDetectionStrategy } from '@angular/core';
import { mockFixtureInputs } from '../../../../mock-data/mock-fixture-inputs';

describe('CaseMarkersComponent', () => {
  let component: CaseMarkersComponent;
  let fixture: ComponentFixture<CaseMarkersComponent>;

  const multipleMarkerhearing = {
    listedCases: [
      {
        markers: [
          {
            id: 'b-c-d-e',
            markerTypeCode: 'AB',
            markerTypeDescription: 'Child abuse',
            markerTypeid: 'b-c-d-e'
          },
          {
            id: 'a-b-c-d',
            markerTypeCode: 'AB',
            markerTypeDescription: 'GBH',
            markerTypeid: 'a-b-c-d'
          }
        ]
      }
    ]
  };

  const singleMarkerhearing = {
    listedCases: [
      {
        markers: [
          {
            id: 'b-c-d-e',
            markerTypeCode: 'AB',
            markerTypeDescription: 'Child abuse',
            markerTypeid: 'b-c-d-e'
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    fixture = TestBed.overrideComponent(CaseMarkersComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).createComponent(CaseMarkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should match snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('single case marker', () => {
    it('should display expected case marker', () => {
      mockFixtureInputs(fixture, {
        hearing: singleMarkerhearing,
        allListedCases: true
      });
      component.ngOnInit();
      fixture.detectChanges();

      const casemarkers = fixture.debugElement
        .queryAll(By.css('.case-marker-title'))
        .map((cm) => cm.nativeElement);
      expect(casemarkers.length).toEqual(1);
      expect(casemarkers[0].innerHTML.trim()).toEqual('Child abuse');
    });
  });

  describe('multiple case markers', () => {
    beforeEach(() => {
      mockFixtureInputs(fixture, {
        hearing: multipleMarkerhearing,
        allListedCases: true
      });
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display expected title with multiple case markers', () => {
      expect(component.title).toEqual('2 markers');
    });

    it('should display multiple case markers', () => {
      const casemarkers = fixture.debugElement
        .queryAll(By.css('.case-marker'))
        .map((cm) => cm.nativeElement);
      expect(casemarkers.length).toEqual(2);
      expect(casemarkers[0].innerHTML.trim()).toEqual('Child abuse');
      expect(casemarkers[1].innerHTML.trim()).toEqual('GBH');
    });
  });
});
