import { PublishStatusMessagePipe } from '../publish-status-message.pipe';
import { CourtListType, MagsPublishStatus } from '../../models/mags-publish-list.dto';

describe('PublishStatusMessagePipe', () => {
  let pipe: PublishStatusMessagePipe;

  beforeEach(() => {
    pipe = new PublishStatusMessagePipe();
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return request sent message for REQUESTED/REQUESTED and not timed out', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: false
      })
    ).toBe('Request to publish Standard list has been sent. Check back or wait to view status.');
  });

  it('should return check back for publish status when requestTimedOut and publish REQUESTED and download not REQUESTED', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.SUCCESSFUL,
        requestTimedOut: true
      })
    ).toBe("Check back to view Standard list's publish status");
  });

  it('should return check back for PDF generation status when requestTimedOut and download REQUESTED and publish not REQUESTED', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: true
      })
    ).toBe("Check back to view Standard list's PDF generation status");
  });

  it('should return check back for status for REQUESTED/REQUESTED when timed out', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: true
      })
    ).toBe("Check back to view Standard list's status");
  });

  it('should return published and ready for SUCCESSFUL/SUCCESSFUL', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe('Standard list has been published and ready for download.');
  });

  it('should return not published PDF generated for FAILED/SUCCESSFUL', () => {
    expect(
      pipe.transform({
        listType: CourtListType.ONLINE_PUBLIC,
        publishStatus: MagsPublishStatus.FAILED,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe(
      'Online public list has not been published. PDF has been generated and available for download.'
    );
  });

  it('should return published PDF not generated for SUCCESSFUL/FAILED', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.FAILED
      })
    ).toBe('Standard list has been published. PDF has not been generated.');
  });

  it('should return not published PDF not generated for FAILED/FAILED', () => {
    expect(
      pipe.transform({
        listType: CourtListType.STANDARD,
        publishStatus: MagsPublishStatus.FAILED,
        downloadStatus: MagsPublishStatus.FAILED
      })
    ).toBe('Standard list has not been published. PDF has not been generated.');
  });

  it('should use list type from map for STANDARD and ONLINE_PUBLIC', () => {
    expect(
      pipe.transform({
        listType: CourtListType.ONLINE_PUBLIC,
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe('Online public list has been published and ready for download.');
  });

  it('should fallback to raw listType for unmapped CourtListType', () => {
    expect(
      pipe.transform({
        listType: CourtListType.ALPHABETICAL,
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toBe('ALPHABETICAL has been published and ready for download.');
  });
});
