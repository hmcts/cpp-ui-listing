import { Component, OnChanges, SimpleChanges, TemplateRef, input, output } from '@angular/core';
import { Store } from '@ngrx/store';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { CourtCentre, CourtRoom, CreateListFilterOptions } from '../../core/model';

import { AppState } from '../../core/reducers';
import {
  DownloadListAction,
  SetPublishListStatusAction,
  downloadUpcomingHearingsAction
} from '../../core/actions';
import { getMomentValue } from '../../core/util';
import {
  PublishStatus,
  PublishCourtListType,
  HearingsGroupedByDateAndRoom
} from '../../core/model/hearing';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import {
  PdkRelatedComponent,
  PdkMarginDirective,
  PdkTypographyDirective,
  PdkLinkDirective,
  PdkListDirective,
  PdkButtonComponent,
  PdkButtonDirective,
  PdkTextColorDirective,
  PdkInsetTextComponent,
  PdkPaddingDirective,
  PdkGridComponent,
  PdkGridDirective,
  PdkCheckboxComponent
} from '@cpp/pdk';
import { MagsPublishListComponent } from './mags-publish-list/mags-publish-list.component';
import { MagsPublishListVM } from '../models/mags-publish-list.vm';
import { CourtListType } from '../models/mags-publish-list.dto';
import { RequiredPermission } from '@cpp/users-groups';

@Component({
  selector: 'download-list',
  templateUrl: './download-list.component.html',
  styleUrls: ['./download-list.component.scss'],
  imports: [
    PdkRelatedComponent,
    PdkMarginDirective,
    PdkTypographyDirective,
    PdkLinkDirective,
    PdkListDirective,
    PdkButtonComponent,
    PdkButtonDirective,
    PdkTextColorDirective,
    PdkInsetTextComponent,
    PdkPaddingDirective,
    PdkGridComponent,
    PdkGridDirective,
    PdkCheckboxComponent,
    MagsPublishListComponent
  ]
})
export class DownloadListComponent implements OnChanges {
  readonly selectedOptions = input<CreateListFilterOptions>(undefined);
  readonly selectedCourtCentre = input<CourtCentre>(undefined);
  readonly restrictionsExist = input<boolean>(undefined);
  readonly crownSelected = input<boolean>(undefined);
  readonly publishCourtListsStatuses = input<PublishStatus[]>(undefined);
  readonly hearingsByDateAndRoom = input<HearingsGroupedByDateAndRoom[]>([]);
  readonly weekHearingsByDateAndRoom = input<HearingsGroupedByDateAndRoom[]>([]);
  readonly isHmctsUser = input<boolean>(undefined);
  readonly magPublishListPermissions = input<RequiredPermission>(undefined);
  readonly magsPublishStatuses = input<MagsPublishListVM[]>(undefined);
  readonly onListPublished = output<PublishStatus>();
  readonly onMagsPublishList = output<{ listType: CourtListType }>();
  readonly onDownloadMagsPublishedList = output<{
    fileId: string;
    listType: CourtListType;
  }>();
  ALL_COURTROOMS = 'All Courtrooms';
  WEEK_COMMENCING = 'Week commencing ';
  TOMORROW = 'Tomorrow ';
  readonly CourtListType = CourtListType;
  isWeekCommencing = false;
  selectedDate: string;
  selectedCourtRoom: string;
  modalRef: BsModalRef;
  listText: string;
  modalConfirmMessage: string;
  showListSuccessMessage = false;
  publishListNameSelected: PublishCourtListType;
  courtRoomsForJudgeList: CourtRoom[];
  sendNotificationToParties: boolean;

  constructor(
    private store: Store<AppState>,
    private modalService: BsModalService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedOptions || changes.selectedCourtCentre) {
      this.selectedDate = this.getDateForDisplay();
      this.selectedCourtRoom = this.getCourtrooms();
    }

    if (changes.hearingsByDateAndRoom) {
      this.courtRoomsForJudgeList = this.getListOfCourtroomsWithHearings(
        changes.hearingsByDateAndRoom.currentValue
      );
    }
  }

  downloadList(courtListType: CourtListType, isRestricted: boolean, courtroom: CourtRoom = null) {
    const opt = this.toDownloadPayload(courtListType, isRestricted, courtroom);
    this.store.dispatch(new DownloadListAction(opt));
  }

  checkForPublishStatus(listType: string) {
    const publishCourtListsStatuses = this.publishCourtListsStatuses();
    return publishCourtListsStatuses
      ? publishCourtListsStatuses.some(s => s.publishCourtListType === listType)
      : null;
  }

  mapPublishStatuses(listType: string) {
    let downLoadListMessage = null;
    const publishCourtListsStatuses = this.publishCourtListsStatuses();
    if (publishCourtListsStatuses) {
      const publishStatus = publishCourtListsStatuses.filter(
        s => s.publishCourtListType === listType
      );
      if (publishStatus && publishStatus.length) {
        const arrayElement = publishStatus.length - 1;
        const status = publishStatus[arrayElement];
        downLoadListMessage = this.formatMessageWithDate(status);
      }
    }

    return downLoadListMessage;
  }

  formatMessageWithDate(publishStatus: PublishStatus) {
    const rawdate = publishStatus.lastUpdated;
    const listType = publishStatus.publishCourtListType;
    const containsUtc = rawdate.indexOf('Z');
    let timeAndDate;
    if (containsUtc) {
      timeAndDate = momentTimezone(rawdate).tz('Europe/London');
    } else {
      timeAndDate = moment.utc(rawdate);
    }
    return `Previous ${listType.toLowerCase()} list published ${timeAndDate.format('HH:mm D MMM')}`;
  }

  getListOfCourtroomsWithHearings(
    hearingsGroupedByDateAndRoom: HearingsGroupedByDateAndRoom[]
  ): CourtRoom[] {
    return (hearingsGroupedByDateAndRoom || []).reduce(
      (courtrooms, hearings) => [
        ...courtrooms,
        ...(hearings.hearingsGroupedByJudiciaryAndRoom || []).map(({ courtRoom }) => courtRoom)
      ],
      []
    );
  }

  private getCourtrooms() {
    const selectedOptions = this.selectedOptions();
    const selectedCourtCentre = this.selectedCourtCentre();
    if (
      !!selectedOptions &&
      selectedOptions.courtRoomId !== '' &&
      !this.crownSelected() &&
      !!selectedCourtCentre
    ) {
      return selectedCourtCentre.courtRooms.find(
        cRoom => cRoom.id === this.selectedOptions().courtRoomId
      ).name;
    } else {
      return this.ALL_COURTROOMS;
    }
  }

  private getDateForDisplay() {
    const date = getMomentValue(this.selectedOptions().startDate);
    const selectedOptions = this.selectedOptions();
    if (selectedOptions && date) {
      const formatted = date.format('D MMMM YYYY');
      if (selectedOptions.startDate === selectedOptions.endDate) {
        this.isWeekCommencing = false;
        return this.isTomorrow(date) ? this.TOMORROW + formatted : formatted;
      } else {
        this.isWeekCommencing = true;
        return this.WEEK_COMMENCING + formatted;
      }
    }
  }

  private isTomorrow(selectedDate) {
    const tomorrow = moment().add(1, 'day');
    return selectedDate.format('D MMMM YYYY') === tomorrow.format('D MMMM YYYY');
  }

  private toDownloadPayload(
    courtListType: CourtListType,
    isRestricted: boolean,
    courtroom: CourtRoom | null = null
  ) {
    const { courtCentreId, courtRoomId, startDate, endDate } = this.selectedOptions();
    return {
      options: {
        courtListType,
        courtCentreId,
        courtRoomId: courtroom?.id ?? courtRoomId ?? '',
        startDate,
        endDate,
        restricted: isRestricted || null
      }
    };
  }

  openModal(template: TemplateRef<any>, listName: string) {
    const lowerCasedName = listName.toLowerCase();
    this.listText = `Publish ${lowerCasedName} list`;

    this.modalConfirmMessage = `Are you sure you want to publish the ${lowerCasedName} hearing list?`;
    this.publishListNameSelected = <PublishCourtListType>listName.toUpperCase();
    this.modalRef = this.modalService.show(template);
  }
  confirmListSubmission() {
    const payload: PublishStatus = {
      courtCentreId: this.selectedCourtCentre().id,
      startDate: this.selectedOptions().startDate,
      endDate: this.selectedOptions().endDate,
      publishCourtListType: this.publishListNameSelected,
      sendNotificationToParties: this.sendNotificationToParties
    };
    this.store.dispatch(new SetPublishListStatusAction(payload));
    const publishMessageStatus = { ...payload, displayDate: this.getDateForDisplay() };
    this.onListPublished.emit(publishMessageStatus);
    this.modalRef.hide();
  }

  cancelModal() {
    this.modalRef.hide();
  }

  magsPublishList(event: { listType: CourtListType }) {
    this.onMagsPublishList.emit({ listType: event.listType });
  }

  downloadMagsPublishedList(event: { listType: CourtListType; fileId: string }) {
    this.onDownloadMagsPublishedList.emit({
      fileId: event.fileId,
      listType: event.listType
    });
  }

  setNotificationsOptIn(sendNotificationToParties: boolean) {
    this.sendNotificationToParties = sendNotificationToParties;
  }

  downloadUpcomingHearings() {
    const options = {
      startDate: this.selectedOptions().startDate,
      courtCentreId: this.selectedOptions().courtCentreId
    };
    this.store.dispatch(downloadUpcomingHearingsAction({ options }));
  }
}
