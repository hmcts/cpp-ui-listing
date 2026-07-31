import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CaseAccessModalComponent } from '../case-access-modal.component';

describe('CaseAccessModalComponent', () => {
  let fixture: ComponentFixture<TestCaseAccessModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), CaseAccessModalComponent],
      declarations: [TestCaseAccessModalComponent],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestCaseAccessModalComponent);
  });

  it('should render the component', () => {
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should submit the form', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('input[value=true]')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith(true);
  });

  it('should submit the form with hearing not running hearing option', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('input[value=false]')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith(false);
  });

  it('should cancel modal', async () => {
    fixture.detectChanges();

    fixture.debugElement.query(By.css('a')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.onCancel).toHaveBeenCalled();
  });

  @Component({
    selector: 'test-case-access-alert',
    template: `
      <case-access-modal
        [urns]="urns"
        [show]="true"
        (onSubmit)="onSubmit($event)"
        (onCancel)="onCancel()"
      >
      </case-access-modal>
    `,
    standalone: false
  })
  class TestCaseAccessModalComponent {
    userId = 'userId';
    urns = ['URN1', 'URN2'];
    onSubmit: jest.Mocked<(_: boolean) => void> = jest.fn();
    onCancel = jest.fn();
  }
});
