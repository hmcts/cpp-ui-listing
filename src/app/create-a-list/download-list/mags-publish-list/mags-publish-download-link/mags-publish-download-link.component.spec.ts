import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MagsPublishDownloadLinkComponent } from './mags-publish-download-link.component';

@Component({
  selector: 'app-test-host',
  template: `
    <mags-publish-download-link
      [fileId]="fileId()"
      [timestamp]="timestamp()"
      [label]="label()"
      (download)="onDownload($event)"
    />
  `,
  imports: [MagsPublishDownloadLinkComponent]
})
class TestHostComponent {
  fileId = signal<string | undefined>(undefined);
  timestamp = signal<string | undefined>(undefined);
  label = signal('');

  onDownload(_fileId: string): void {}
}

describe('MagsPublishDownloadLinkComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: MagsPublishDownloadLinkComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(MagsPublishDownloadLinkComponent)
    ).componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not render link or timestamp when fileId and timestamp are unset', () => {
    host.fileId.set(undefined);
    host.timestamp.set(undefined);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-role="download-publish-list"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'))).toBeFalsy();
  });

  it('should render download link when fileId is set', () => {
    host.fileId.set('abc-123');
    host.label.set('Standard court list');
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('[data-role="download-publish-list"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent.trim()).toBe('Download standard court list');
  });

  it('should render timestamp when only timestamp is set', () => {
    host.timestamp.set('15 Jan 2024, 12:00');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-role="download-publish-list"]'))).toBeFalsy();
    const ts = fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'));
    expect(ts?.nativeElement.textContent.trim()).toBe('15 Jan 2024, 12:00');
  });

  it('should render both link and timestamp when both are set', () => {
    host.fileId.set('file-1');
    host.timestamp.set('15 Jan 2024, 12:00');
    host.label.set('Online public court list');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-role="download-publish-list"]'))).toBeTruthy();
    const ts = fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'));
    expect(ts?.nativeElement.textContent.trim()).toBe('15 Jan 2024, 12:00');
  });

  it('should emit download with fileId when the link is clicked', () => {
    const spy = jest.spyOn(host, 'onDownload');
    const fileId = '123e4567-e89b-12d3-a456-426614174000';
    host.fileId.set(fileId);
    host.label.set('Standard court list');
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.link-btn'))!.nativeElement.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(fileId);
  });
});
