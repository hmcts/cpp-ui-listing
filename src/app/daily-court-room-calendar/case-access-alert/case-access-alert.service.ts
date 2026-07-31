import { Injectable } from '@angular/core';
import moment from 'moment';

const CASE_ACCESS_KEY = 'accessAlert';

interface CaseAccessDetails {
  userId: string;
  hearingIds: string[];
  expires: number;
}

@Injectable()
export class CaseAccessAlertService {
  constructor() {}

  private getSavedDetails(): CaseAccessDetails | null {
    const json = localStorage.getItem(CASE_ACCESS_KEY);
    if (json) {
      return JSON.parse(json) as CaseAccessDetails;
    }

    return null;
  }

  shouldShowModal(
    hearingIds: string[],
    userId: string,
    selectedHearingId?: string,
    searchDate?: string
  ): boolean {
    const details: CaseAccessDetails = this.getSavedDetails();

    if (new Date(searchDate).getTime() > moment().toDate().getTime()) {
      return false;
    }

    if (details && details.userId === userId && details.expires > moment().toDate().getTime()) {
      if (selectedHearingId) {
        return (
          hearingIds.includes(selectedHearingId) && !details.hearingIds.includes(selectedHearingId)
        );
      }

      return !hearingIds.every((id) => details.hearingIds.includes(id));
    }

    localStorage.removeItem(CASE_ACCESS_KEY);

    if (selectedHearingId) {
      return hearingIds.includes(selectedHearingId) && !!userId;
    }

    return hearingIds.length > 0 && !!userId;
  }

  saveDecision(hearingIds: string[], userId: string) {
    const details: CaseAccessDetails = this.getSavedDetails();
    let newDetails: CaseAccessDetails;
    if (details) {
      newDetails = {
        ...details,
        hearingIds: Array.from(new Set([...details.hearingIds, ...hearingIds]))
      };
    } else {
      newDetails = {
        userId,
        hearingIds,
        expires: moment().endOf('day').toDate().getTime()
      };
    }
    localStorage.setItem(CASE_ACCESS_KEY, JSON.stringify(newDetails));
  }
}
