import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngrx/store';
import { validHearingMock1 } from '../../mock-data/test-fixtures';
import { AllocateHearingContainer } from '../allocate-hearing/allocate-hearing.container';
import {
  AppState,
  Hearing,
  ListUnallocatedHearingsSuccessAction,
  ScheduledAllocateHearingAction,
  reducers
} from '../core';
import { UnallocatedHearings } from '../core/model/hearing';
import { SplitHearingFormComponent } from './split-hearing-form/split-hearing-form.component';
import { SplitHearingContainer } from './split-hearing.container';

describe('SplitHearingContainer', () => {
  let fixture: ComponentFixture<SplitHearingContainer>;
  let component: SplitHearingFormComponent;
  let store: Store<AppState>;

  const mockHearings: Hearing[] = [validHearingMock1];

  const scrollSpy = jasmine.createSpy('scroll');

  describe('View split case', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([{ path: 'unallocated/:id', component: AllocateHearingContainer }]),
          provideStore(reducers),
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: {
                  id: validHearingMock1.id
                },
                queryParams: {
                  referrer: ''
                }
              }
            }
          },
          { provide: 'Window', useValue: { scroll: scrollSpy } }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        teardown: { destroyAfterEach: false }
      }).configureCompiler({
        preserveWhitespaces: false
      } as any);

      store = TestBed.inject(Store);
      fixture = TestBed.createComponent(SplitHearingContainer);
      store.dispatch(
        new ListUnallocatedHearingsSuccessAction({ hearings: mockHearings } as UnallocatedHearings)
      );

      jest.spyOn(store, 'dispatch');
      fixture.detectChanges();

      component = fixture.debugElement.query(
        By.directive(SplitHearingFormComponent)
      ).componentInstance;
    });

    it('should split hearing with ONE defendant and ONE offence and trigger allocate hearing action', () => {
      const splitedHearing = JSON.parse(JSON.stringify(validHearingMock1));

      const splitedHearingIds = {
        caseIds: [splitedHearing.listedCases[0].id],
        defendantIds: [splitedHearing.listedCases[0].defendants[1].id],
        offenceIds: [splitedHearing.listedCases[0].defendants[1].offences[1].id]
      };

      const defendantsToInclude = splitedHearing.listedCases[0].defendants.slice(1);
      const offencesToInclude = splitedHearing.listedCases[0].defendants[1].offences.slice(1);

      splitedHearing.listedCases[0].defendants = defendantsToInclude;
      splitedHearing.listedCases[0].defendants[0].offences = offencesToInclude;

      component.onSubmit.emit(splitedHearingIds);

      const expectedAction = new ScheduledAllocateHearingAction(splitedHearing);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should split hearing with whole hearing option and trigger allocate hearing action', () => {
      component.onSubmit.emit(undefined);

      const expectedAction = new ScheduledAllocateHearingAction(validHearingMock1);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });
});
