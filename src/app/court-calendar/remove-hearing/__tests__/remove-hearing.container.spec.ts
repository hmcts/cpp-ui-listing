import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveHearingContainer } from '../containers/remove-hearing.container';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideRouter, Router } from '@angular/router';
import { CourtCalendarActions, CourtCalendarFeatureState } from '../../state';
import { getRemoveHearingVm } from '../../state/selectors';
import { RemoveHearingPayload } from '../../model';

describe('RemoveHearingContainer', () => {
  let component: RemoveHearingContainer;
  let fixture: ComponentFixture<RemoveHearingContainer>;
  let store: MockStore<CourtCalendarFeatureState>;
  let router: Router;
  let dispatchSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;

  const mockHearingToRemove = {
    hearingId: '00cae52d-3ed4-4fca-88f9-e32a29c8f939',
    hearingDetails: 'Mock Hearing Details',
    caseNumber: '081bc9b6-4949-4e35-86a5-68c9c08a38cd',
    reasonToRemove: 'Reason to remove hearing'
  };

  const mockRemoveHearingPayload: RemoveHearingPayload = {
    hearingId: mockHearingToRemove.hearingId,
    reason: mockHearingToRemove.reasonToRemove
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [{ selector: getRemoveHearingVm, value: mockHearingToRemove }]
        }),
        provideRouter([])
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveHearingContainer);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    navigateSpy = spyOn(router, 'navigate').and.callThrough();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load hearing data from store', () => {
    component.hearingToRemove$.subscribe((hearing) => {
      expect(hearing).toEqual(mockHearingToRemove);
    });
  });

  it('should handle validation errors', () => {
    component.errors = [
      { id: '1', message: 'Enter a reason why you want to remove this hearing', shouldFocus: true }
    ];
    fixture.detectChanges();

    const errorSummary = fixture.debugElement.nativeElement.querySelector('pdk-error-summary');
    expect(errorSummary).toBeTruthy();
    expect(errorSummary.textContent).toContain(
      'Enter a reason why you want to remove this hearing'
    );
  });

  it('should dispatch removeSelectedHearing action when removeHearing is called', () => {
    component.removeHearing(mockRemoveHearingPayload);
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.removeSelectedHearing({ payload: mockRemoveHearingPayload })
    );
  });

  it('should navigate to /court-calendar when onCancel is called', () => {
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/court-calendar']);
  });

  it('should dispatch setSelectedHearingData when onCancel is called', () => {
    component.onCancel();
    expect(dispatchSpy).toHaveBeenCalledWith(
      CourtCalendarActions.setSelectedHearingData({ selectedHearing: null })
    );
  });
});
