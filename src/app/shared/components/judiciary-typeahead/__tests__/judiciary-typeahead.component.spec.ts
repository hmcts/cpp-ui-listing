import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { JudiciaryTypeGroup, ReferenceDataService } from '@cpp/reference-data';
import { provideStore } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { reducers } from '../../../../core';
import {
  JudiciaryAutoSuggestOption,
  JudiciaryTypeaheadComponent
} from '../judiciary-typeahead.component';
import { judiciaries } from './text-mock-data';

describe('JudiciaryTypeaheadComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: JudiciaryTypeaheadComponent;
  let fetchJudicialMembers: jasmine.Spy;

  beforeEach(() => {
    fetchJudicialMembers = jasmine.createSpy('fetchJudicialMembers');
    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers),
        { provide: ReferenceDataService, useValue: { fetchJudicialMembers } }
      ],
      teardown: { destroyAfterEach: false }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(
      By.directive(JudiciaryTypeaheadComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it('should show judiciaries filtered by judiciary type', fakeAsync(() => {
    fixture.componentInstance.judgeType = 'DEPUTY_DISTRICT_JUDGE';
    fixture.detectChanges();
    component.input$.next('Olubunmi');
    const nextSpy = spyOn(component.source$, 'next');

    const expectedJudiciaries = judiciaries
      .filter((judi) => judi.judiciaryType === 'Deputy District Judge (MC)- Fee paid')
      .map((judi) => ({ ...judi, judicialMemberName: `${judi.forenames} ${judi.surname}` }));

    fetchJudicialMembers.and.returnValue(of(expectedJudiciaries));

    tick(300);

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(nextSpy).toHaveBeenCalledWith(expectedJudiciaries);
  }));

  it('should show ljaShortName if it`s provided by endpoint', () => {
    const magistrate = judiciaries.find((judi) => judi.judiciaryType === 'Magistrate');
    const expectedJudiciaries: JudiciaryAutoSuggestOption[] = [
      {
        ...magistrate,
        judicialMemberName: `${magistrate.forenames} ${magistrate.surname}`
      }
    ] as JudiciaryAutoSuggestOption[];

    component.source$ = of(expectedJudiciaries) as Subject<JudiciaryAutoSuggestOption[]>;

    fixture.detectChanges();

    const autoSuggestOption = fixture.debugElement.query(By.css('pdk-autosuggest-option > div'))
      .nativeElement.textContent;

    expect(autoSuggestOption).toContain(magistrate.ljaShortName);
  });
});

@Component({
  template: `
    <form>
      <judiciary-typeahead
        [attr.data-test-id]="judgeType"
        [name]="'judiciary' + judgeType"
        ngModel
        [judiciaryType]="judgeType"
      >
      </judiciary-typeahead>
    </form>
  `,
  imports: [JudiciaryTypeaheadComponent, FormsModule]
})
class TestHostComponent {
  judgeType: JudiciaryTypeGroup = 'DEPUTY_DISTRICT_JUDGE';
}
