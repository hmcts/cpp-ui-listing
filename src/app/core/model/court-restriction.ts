export interface CourtRestriction {
  hearingId: string;
  caseIds?: string[];
  defendantIds?: string[];
  courtApplicationSubjectIds?: string[];
  courtApplicationIds?: string[];
  restrictCourtList: boolean;
  restrictionEventType?: CourtRestrictionEventType;
}

export enum CourtRestrictionEventType {
  Case = 'CASE',
  Defendant = 'DEFENDANT',
  Application = 'APPLICATION',
  SUBJECT = 'SUBJECT'
}
