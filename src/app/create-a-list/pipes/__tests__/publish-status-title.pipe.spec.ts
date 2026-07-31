import { PublishStatusTitlePipe } from '../publish-status-title.pipe';
import { MagsPublishStatus } from '../../models/mags-publish-list.dto';

describe('PublishStatusTitlePipe', () => {
  let pipe: PublishStatusTitlePipe;

  beforeEach(() => {
    pipe = new PublishStatusTitlePipe();
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return "Request sent successfully" for REQUESTED/REQUESTED and not timed out', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: false
      })
    ).toBe('Request sent successfully');
  });

  it('should return "Your request is being processed" for REQUESTED/REQUESTED when requestTimedOut true', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: true
      })
    ).toBe('Your request is being processed');
  });

  it('should return "Publish successful" for SUCCESSFUL/SUCCESSFUL', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe('Publish successful');
  });

  it('should return "Publish failed and PDF generated" for FAILED/SUCCESSFUL', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.FAILED,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe('Publish failed and PDF generated');
  });

  it('should return "Publish successful and PDF not generated" for SUCCESSFUL/FAILED', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.FAILED
      })
    ).toBe('Publish successful and PDF not generated');
  });

  it('should return "Publish unsuccessful and PDF not generated" for FAILED/FAILED', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.FAILED,
        downloadStatus: MagsPublishStatus.FAILED
      })
    ).toBe('Publish unsuccessful and PDF not generated');
  });

  it('should return "Publish request is still being processed" when requestTimedOut and publish REQUESTED and download not REQUESTED', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.SUCCESSFUL,
        requestTimedOut: true
      })
    ).toBe('Publish request is still being processed');
  });

  it('should return "PDF generation is still being processed" when requestTimedOut and download REQUESTED and publish not REQUESTED', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: true
      })
    ).toBe('PDF generation is still being processed');
  });

  it('should return "Your request is being processed" for other combinations', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe('Your request is being processed');
  });
});
