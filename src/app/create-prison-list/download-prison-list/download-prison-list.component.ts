import { Component, OnChanges, SimpleChanges, input } from '@angular/core';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { CourtCentre, CourtRoom, CreateListFilterOptions } from '../../core/model';

import { AppState } from '../../core/reducers';
import { downloadPrisonListAction } from '../../core/actions';
import { getMomentValue } from '../../core/util';

import {
  PdkInsetTextComponent,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkTextColorDirective
} from '@cpp/pdk';

@Component({
  selector: 'download-prison-list',
  templateUrl: './download-prison-list.component.html',
  styleUrls: ['./download-prison-list.component.scss'],
  imports: [PdkInsetTextComponent, PdkButtonComponent, PdkButtonDirective, PdkTextColorDirective]
})
export class DownloadPrisonListComponent implements OnChanges {
  readonly selectedOptions = input<CreateListFilterOptions>(undefined);
  readonly selectedCourtCentre = input<CourtCentre>(undefined);
  readonly crownSelected = input<boolean>(undefined);
  readonly isPrisonAdminOrHmctsUser = input<boolean>(undefined);
  readonly hasAllocatedHearingsByDateRange = input<boolean>(undefined);

  TOMORROW = 'Tomorrow ';
  selectedDate: string;

  constructor(private store: Store<AppState>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedOptions || changes.selectedCourtCentre) {
      this.selectedDate = this.getDateForDisplay();
    }
  }

  private getDateForDisplay() {
    const date = getMomentValue(this.selectedOptions().startDate);
    const selectedOptions = this.selectedOptions();
    if (selectedOptions && date) {
      const formatted = date.format('D MMMM YYYY');
      if (selectedOptions.startDate === selectedOptions.endDate) {
        return this.isTomorrow(date) ? this.TOMORROW + formatted : formatted;
      }
    }
  }

  downloadPrisonList(isRestricted: boolean, courtroom: CourtRoom = null) {
    const opt = this.setListId(isRestricted, courtroom);
    this.store.dispatch(downloadPrisonListAction(opt));
  }

  private isTomorrow(selectedDate) {
    const tomorrow = moment().add(1, 'day');
    return selectedDate.format('D MMMM YYYY') === tomorrow.format('D MMMM YYYY');
  }

  private setListId(isRestricted: boolean, courtroom: CourtRoom = null) {
    const params = {
      courtCentreId: this.selectedOptions().courtCentreId,
      courtRoomId: (courtroom && courtroom.id) || this.selectedOptions().courtRoomId || '',
      startDate: this.selectedOptions().startDate,
      endDate: this.selectedOptions().endDate,
      restricted: isRestricted || null
    };

    return { options: params };
  }
}
