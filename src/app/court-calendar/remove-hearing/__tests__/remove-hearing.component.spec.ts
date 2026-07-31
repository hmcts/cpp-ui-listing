import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveHearingComponent } from '../components/remove-hearing.component';
import { RemoveHearingVM } from '../../model';
import { By } from '@angular/platform-browser';
import { mockHearingToRemoves } from '../../utils/mocks';

describe('RemoveHearingComponent', () => {
  let component: RemoveHearingComponent;
  let fixture: ComponentFixture<RemoveHearingComponent>;

  const mockHearingToRemove: RemoveHearingVM = mockHearingToRemoves;

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveHearingComponent);
    component = fixture.componentInstance;
    component.hearingToRemove = mockHearingToRemove;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize hearingToRemove correctly', () => {
    expect(component.hearingToRemove).toEqual(mockHearingToRemove);
  });

  it('should map hearing details correctly', () => {
    const labelMap = component.hearingDetailsLabels;
    expect(labelMap['courtName']).toEqual('Court');
    expect(labelMap['startDate']).toEqual('Date');
    expect(labelMap['courtRoom']).toEqual('Courtroom');
    expect(labelMap['duration']).toEqual('Duration');
    expect(labelMap['hearingType']).toEqual('Hearing type');
    expect(labelMap['hearingLanguage']).toEqual('Hearing language');
    expect(labelMap['videoHearing']).toEqual('Video hearing');
    expect(labelMap['multiDayHearing']).toEqual('Multi-day hearing');
  });

  it('should emit onRemoveHearing event when removeHearing is called', () => {
    const onRemoveHearingSpy = spyOn(component.onRemoveHearing, 'emit');

    const formValue = { reason: 'Test reason to remove hearing' };
    component.removeHearing(formValue);

    expect(onRemoveHearingSpy).toHaveBeenCalledWith({
      ...formValue,
      hearingId: mockHearingToRemove.id
    });
  });

  it('should emit cancel event when cancel button is clicked', () => {
    const cancelSpy = spyOn(component.cancel, 'emit');

    const cancelRemoveHrearingLink = fixture.debugElement.query(
      By.css('a[data-test-id="cancel-remove-hearing"]')
    ).nativeElement as HTMLAnchorElement;
    cancelRemoveHrearingLink.click();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
