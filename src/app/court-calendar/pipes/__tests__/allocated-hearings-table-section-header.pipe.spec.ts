import { AllocatedHearingsTableSectionHeaderPipe } from '../allocated-hearings-table-section-header.pipe';
import { CourtRoomCalendarVM } from '../../state';
import { DatePipe } from '@angular/common';
import { courtRoomCalendarMock } from '../../utils/mocks';
import { TotalHearingAndDurationTextPipe } from '../total-hearings-and-duration-text.pipe';

describe('AllocatedHearingsSectionHeaderPipe', () => {
  let pipe: AllocatedHearingsTableSectionHeaderPipe;
  let totalHearingAndDurationTextPipe: TotalHearingAndDurationTextPipe;

  beforeEach(() => {
    totalHearingAndDurationTextPipe = new TotalHearingAndDurationTextPipe();
    jest.spyOn(totalHearingAndDurationTextPipe, 'transform');
    pipe = new AllocatedHearingsTableSectionHeaderPipe();
    pipe.totalHearingAndDurationTextPipe = totalHearingAndDurationTextPipe;
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform section data correctly', () => {
    const section = courtRoomCalendarMock[0] as CourtRoomCalendarVM;
    const result = pipe.transform(section);
    expect(result.sectionName).toBe('05 November 2020: mockCourtRoomName');
    expect(result.totalDurationText).toBe('(1 hearing, 20 minutes listed)');
    expect(totalHearingAndDurationTextPipe.transform).toHaveBeenCalledWith(
      section.judiciaryCalendar[0].hearingTimeCalendar
    );
  });

  it('should handle empty judiciaryCalendar gracefully', () => {
    const section: CourtRoomCalendarVM = {
      courtRoomName: 'Court B',
      date: '2024-01-14T00:00:00Z',
      judiciaryCalendar: [
        {
          hearingTimeCalendar: []
        }
      ]
    } as CourtRoomCalendarVM;

    const result = pipe.transform(section);

    expect(result.sectionName).toBe('14 January 2024: Court B');
    expect(result.totalDurationText).toBe('(0 hearings, 0 minutes listed)');
    expect(totalHearingAndDurationTextPipe.transform).toHaveBeenCalledWith(
      section.judiciaryCalendar[0].hearingTimeCalendar
    );
  });

  it('should handle cases where no hearings are marked as master', () => {
    const section = courtRoomCalendarMock[0] as CourtRoomCalendarVM;
    section.judiciaryCalendar[0].hearingTimeCalendar[0].hearings[0].isMaster = false;

    const result = pipe.transform(section);

    expect(result.sectionName).toBe('05 November 2020: mockCourtRoomName');
    expect(result.totalDurationText).toBe('(0 hearings, 0 minutes listed)');
    expect(totalHearingAndDurationTextPipe.transform).toHaveBeenCalledWith(
      section.judiciaryCalendar[0].hearingTimeCalendar
    );
  });

  it('should format date correctly using DatePipe', () => {
    const section: CourtRoomCalendarVM = {
      courtRoomName: 'Court D',
      date: '2024-02-01T00:00:00Z',
      judiciaryCalendar: []
    } as CourtRoomCalendarVM;

    const datePipe = new DatePipe('en-GB');
    const formattedDate = datePipe.transform(section.date, 'dd MMMM yyyy');

    const result = pipe.transform(section);

    expect(result.sectionName).toBe(`${formattedDate}: Court D`);
  });
});
