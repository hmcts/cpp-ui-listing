import { PublishStatusPanelConfigPipe } from '../publish-status-panel-config.pipe';
import { MagsPublishStatus } from '../../models/mags-publish-list.dto';

describe('PublishStatusPanelConfigPipe', () => {
  let pipe: PublishStatusPanelConfigPipe;

  beforeEach(() => {
    pipe = new PublishStatusPanelConfigPipe();
  });

  it('should return success config for null', () => {
    expect(pipe.transform(null)).toEqual({ icon: 'tick', type: 'success' });
  });

  it('should return success config for undefined', () => {
    expect(pipe.transform(undefined)).toEqual({ icon: 'tick', type: 'success' });
  });

  it('should return warn/invalid for FAILED/SUCCESSFUL', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.FAILED,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toEqual({ icon: 'warn', type: 'invalid' });
  });

  it('should return warn/invalid for SUCCESSFUL/FAILED', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.FAILED
      })
    ).toEqual({ icon: 'warn', type: 'invalid' });
  });

  it('should return warn/invalid for FAILED/FAILED', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.FAILED,
        downloadStatus: MagsPublishStatus.FAILED
      })
    ).toEqual({ icon: 'warn', type: 'invalid' });
  });

  it('should return warn/notice for requestTimedOut', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: true
      })
    ).toEqual({ icon: 'warn', type: 'notice' });
  });

  it('should return success config for REQUESTED/REQUESTED and not timed out', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.REQUESTED,
        downloadStatus: MagsPublishStatus.REQUESTED,
        requestTimedOut: false
      })
    ).toEqual({ icon: 'tick', type: 'success' });
  });

  it('should return success config for SUCCESSFUL/SUCCESSFUL', () => {
    expect(
      pipe.transform({
        publishStatus: MagsPublishStatus.SUCCESSFUL,
        downloadStatus: MagsPublishStatus.SUCCESSFUL
      })
    ).toEqual({ icon: 'tick', type: 'success' });
  });
});
