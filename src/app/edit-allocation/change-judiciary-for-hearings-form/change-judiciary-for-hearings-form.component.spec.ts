import { Component, input } from '@angular/core';
import { CourtCentre, Hearing } from '../../core/';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeJudiciaryForHearingsFormComponent } from './change-judiciary-for-hearings-form.component';
import { courtCentresMock, validHearingMock1 } from '../../../mock-data/test-fixtures';
import { By } from '@angular/platform-browser';
import { ReferenceDataService } from '@cpp/reference-data';
import { CppHttp } from '@cpp/core';

@Component({
  template: `
    <change-judiciary-for-hearings-form [hearings]="hearings()" [courtCentres]="courtCentres()">
    </change-judiciary-for-hearings-form>
  `,
  imports: [ChangeJudiciaryForHearingsFormComponent]
})
class TestHostComponent {
  readonly hearings = input<Hearing[]>([validHearingMock1]);
  readonly courtCentres = input<CourtCentre[]>(courtCentresMock);
}

describe('ChangeJudiciaryForHearingsFormComponent', () => {
  let component: ChangeJudiciaryForHearingsFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const createComponent = (params = {}) => {
    TestBed.configureTestingModule({
      providers: [
        ReferenceDataService,
        {
          provide: CppHttp,
          useValue: {
            query: jasmine.createSpy(),
            commandSync: jasmine.createSpy()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  };

  beforeEach(fakeAsync(() => {
    createComponent(false);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
    tick();
  }));

  describe('Normal behaviour', () => {
    it('should match Jest snapshot', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should emit an event when cancelling', fakeAsync(() => {
      jest.spyOn(component.onCancel, 'emit');
      const btn = fixture.debugElement.query(By.css('a'));
      btn.nativeElement.click();
      tick();

      expect(component.onCancel.emit).toHaveBeenCalled();
    }));

    it('should emit an event when submit', fakeAsync(() => {
      spyOn(component.onSubmit, 'emit');
      const btn = fixture.debugElement.query(By.css('button'));
      btn.nativeElement.click();
      tick();

      expect(component.onSubmit.emit).toHaveBeenCalled();
    }));
  });
});
