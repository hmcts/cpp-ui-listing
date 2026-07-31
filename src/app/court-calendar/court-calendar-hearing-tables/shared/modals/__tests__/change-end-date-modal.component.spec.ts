import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PDK_MODAL_DATA_TOKEN } from '@cpp/pdk';
import { CPPDate } from '../../../../../core/util';
import {
  ChangeEndDateModalComponent,
  ChangeEndDateModalData
} from '../change-end-date-modal.component';

describe('ChangeEndDateModalComponent', () => {
  let fixture: ComponentFixture<ChangeEndDateModalComponent>;
  let component: ChangeEndDateModalComponent;

  const modalData: ChangeEndDateModalData = {
    hearingTypeDescription: 'Trial',
    hearingDayCount: 3,
    endDate: '2026-01-15',
    continue: jest.fn(),
    cancel: jest.fn()
  };

  // The date input carries a futureDate validator, so the seeded value has to be a real
  // "today" rather than a fixed date, otherwise the form is legitimately invalid.
  const now = new Date();
  const todayIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
  const mockCppDate = { format: jest.fn().mockReturnValue(todayIso) } as unknown as CPPDate;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeEndDateModalComponent],
      providers: [
        { provide: PDK_MODAL_DATA_TOKEN, useValue: modalData },
        { provide: CPPDate, useValue: mockCppDate }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeEndDateModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected modal data', () => {
    expect(component.modalData).toBe(modalData);
  });

  it('should default todayDate to the formatted current date', () => {
    expect(component.todayDate).toBe(todayIso);
  });

  it('should provide the required error message', () => {
    expect(component.errorMessages).toEqual([
      { rule: 'required', message: 'Enter a new hearing end date' }
    ]);
  });

  describe('template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render the hearing type description and day count', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Trial');
      expect(text).toContain('3 hearing days');
    });

    it('should call cancel when the Cancel link is clicked', () => {
      const cancelLink = fixture.debugElement.query(By.css('a[pdk-link]'));
      cancelLink.triggerEventHandler('click', {});

      expect(modalData.cancel).toHaveBeenCalled();
    });

    it('should call continue on valid form submission', () => {
      const form = fixture.debugElement.query(By.css('[data-test-id="change-end-date-form"]'));
      form.triggerEventHandler('validSubmit', {});

      expect(modalData.continue).toHaveBeenCalled();
    });
  });

  describe('date input binding', () => {
    it('should seed the date input with today and pass it to continue on submit', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(
        By.css('[data-test-id="change-end-date-form"]')
      );
      const ngForm = formElement.injector.get(NgForm);

      const [year, month, day] = todayIso.split('-');
      expect(ngForm.value).toEqual({ newEndDate: todayIso });
      expect(ngForm.valid).toBe(true);
      expect(
        Array.from(fixture.nativeElement.querySelectorAll('input')).map(
          (input: HTMLInputElement) => input.value
        )
      ).toEqual([day, month, year]);

      formElement.nativeElement.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(modalData.continue).toHaveBeenCalledWith(todayIso);
    });

    it('should not submit when the date has been cleared', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(
        By.css('[data-test-id="change-end-date-form"]')
      );
      const ngForm = formElement.injector.get(NgForm);
      ngForm.controls.newEndDate.setValue(null);
      fixture.detectChanges();

      formElement.nativeElement.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(ngForm.valid).toBe(false);
      expect(modalData.continue).not.toHaveBeenCalled();
    });
  });
});
