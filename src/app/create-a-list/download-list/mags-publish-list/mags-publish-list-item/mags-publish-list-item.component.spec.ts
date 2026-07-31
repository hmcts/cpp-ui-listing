import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MagsPublishListItemComponent } from './mags-publish-list-item.component';
import { MagsPublishListVM } from '../../../models/mags-publish-list.vm';
import { CourtListType, MagsPublishStatus } from '../../../models/mags-publish-list.dto';

const statusRequested: MagsPublishListVM = {
  publishRequestId: 'req-1',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.REQUESTED,
  downloadStatus: MagsPublishStatus.REQUESTED,
  lastUpdated: '2024-01-15T10:00:00Z',
  listType: CourtListType.STANDARD
};

const statusSuccessfulWithDownload: MagsPublishListVM = {
  publishRequestId: 'req-2',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.SUCCESSFUL,
  downloadStatus: MagsPublishStatus.SUCCESSFUL,
  lastUpdated: '2024-01-15T12:00:00Z',
  fileId: '123e4567-e89b-12d3-a456-426614174001',
  listType: CourtListType.STANDARD
};

const statusSuccessfulDownloadFailed: MagsPublishListVM = {
  publishRequestId: 'req-3',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.SUCCESSFUL,
  downloadStatus: MagsPublishStatus.FAILED,
  lastUpdated: '2024-01-15T12:00:00Z',
  listType: CourtListType.ONLINE_PUBLIC
};

const statusPublishFailed: MagsPublishListVM = {
  publishRequestId: 'req-4',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.FAILED,
  downloadStatus: MagsPublishStatus.FAILED,
  lastUpdated: '2024-01-15T12:00:00Z',
  listType: CourtListType.STANDARD
};

const statusPublishFailedDownloadSuccess: MagsPublishListVM = {
  publishRequestId: 'req-5',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.FAILED,
  downloadStatus: MagsPublishStatus.SUCCESSFUL,
  lastUpdated: '2024-01-15T12:00:00Z',
  listType: CourtListType.STANDARD
};

@Component({
  selector: 'app-test-host',
  template: `
    <mags-publish-list-item
      [label]="label()"
      [status]="status()"
      (publish)="onPublish()"
      (download)="onDownload($event)"
    ></mags-publish-list-item>
  `,
  imports: [MagsPublishListItemComponent]
})
class TestHostComponent {
  label = signal('');
  status = signal<MagsPublishListVM | null>(null);

  onPublish(): void {}
  onDownload(_fileId: string): void {}
}

describe('MagsPublishListItemComponent', () => {
  let component: MagsPublishListItemComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

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
      By.directive(MagsPublishListItemComponent)
    ).componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display Standard court list label', () => {
    host.label.set('Standard court list');
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn?.nativeElement.textContent.trim()).toBe('Standard court list');
  });

  it('should display Online public court list label', () => {
    host.label.set('Online public court list');
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn?.nativeElement.textContent.trim()).toBe('Online public court list');
  });

  it('should show no tags, no download link, no timestamp when status is null', () => {
    host.status.set(null);
    host.label.set('Test list');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('pdk-tag'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.link-btn'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'))).toBeFalsy();
  });

  it('should show Requested tag when status is REQUESTED', () => {
    host.status.set(statusRequested);
    host.label.set('Standard court list');
    fixture.detectChanges();

    const tags = fixture.debugElement.queryAll(By.css('pdk-tag'));
    expect(tags.length).toBe(1);
    expect(tags[0].nativeElement.textContent.trim()).toBe('Requested');
  });

  it('should not show download link when status is REQUESTED', () => {
    host.status.set(statusRequested);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.link-btn'))).toBeFalsy();
  });

  it('should show Published and PDF generated tags when publish and download are SUCCESSFUL', () => {
    host.status.set(statusSuccessfulWithDownload);
    host.label.set('Standard court list');
    fixture.detectChanges();

    const tags = fixture.debugElement.queryAll(By.css('pdk-tag'));
    expect(tags.length).toBe(2);
    expect(tags[0].nativeElement.textContent.trim()).toBe('Published');
    expect(tags[1].nativeElement.textContent.trim()).toBe('PDF generated');
  });

  it('should show download link when publish and download are SUCCESSFUL (Standard court list)', () => {
    host.status.set(statusSuccessfulWithDownload);
    host.label.set('Standard court list');
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('.link-btn'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent.trim()).toBe('Download standard court list');
  });

  it('should show download link when publish and download are SUCCESSFUL (Online public court list)', () => {
    host.status.set(statusSuccessfulWithDownload);
    host.label.set('Online public court list');
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('.link-btn'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent.trim()).toBe('Download online public court list');
  });

  it('should show Published on when publish status is SUCCESSFUL', () => {
    host.status.set(statusSuccessfulWithDownload);
    host.label.set('Standard court list');
    fixture.detectChanges();

    const timestampEl = fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'));
    expect(timestampEl?.nativeElement.textContent).toContain('Published on');
  });

  it('should show Published and PDF not generated tags when publish SUCCESSFUL and download FAILED', () => {
    host.status.set(statusSuccessfulDownloadFailed);
    fixture.detectChanges();

    const tags = fixture.debugElement.queryAll(By.css('pdk-tag'));
    expect(tags.length).toBe(2);
    expect(tags[0].nativeElement.textContent.trim()).toBe('Published');
    expect(tags[1].nativeElement.textContent.trim()).toBe('PDF not generated');
  });

  it('should not show download link when download status is FAILED', () => {
    host.status.set(statusSuccessfulDownloadFailed);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.link-btn'))).toBeFalsy();
  });

  it('should show Publish failed and PDF not generated tags when publish status is FAILED and download FAILED', () => {
    host.status.set(statusPublishFailed);
    fixture.detectChanges();

    const tags = fixture.debugElement.queryAll(By.css('pdk-tag'));
    expect(tags.length).toBe(2);
    expect(tags[0].nativeElement.textContent.trim()).toBe('Publish failed');
    expect(tags[1].nativeElement.textContent.trim()).toBe('PDF not generated');
  });

  it('should show Generated on when publish status is not SUCCESSFUL but download SUCCESSFUL', () => {
    host.status.set(statusPublishFailedDownloadSuccess);
    fixture.detectChanges();

    const timestampEl = fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'));
    expect(timestampEl?.nativeElement.textContent).toContain('Generated on');
  });

  it('should emit publish when the button is clicked', () => {
    const publishSpy = jest.spyOn(host, 'onPublish');
    host.label.set('Test list');
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    btn.nativeElement.click();
    fixture.detectChanges();

    expect(publishSpy).toHaveBeenCalled();
  });

  it('should emit download with fileId when download link is clicked', () => {
    const downloadSpy = jest.spyOn(host, 'onDownload');
    host.status.set(statusSuccessfulWithDownload);
    host.label.set('Standard court list');
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('.link-btn'));
    link.nativeElement.click();
    fixture.detectChanges();

    expect(downloadSpy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
  });

  it('should not show timestamp when status is REQUESTED', () => {
    host.status.set(statusRequested);
    fixture.detectChanges();
    const timestampEl = fixture.debugElement.query(By.css('[pdk-text-colour="dark-grey"]'));
    expect(timestampEl).toBeFalsy();
  });
});
