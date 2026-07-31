export interface Offence {
  id: string;
  offenceCode: string;
  startDate: string;
  endDate?: string;
  statementOfOffence: StatementOfOffence;
  reportingRestrictions?: ReportingRestriction[];
  restrictFromCourtList?: boolean;
  shadowListed?: boolean;
  offenceId?: string;
  offenceWording?: string;
  count: number;
  orderIndex: number;
}

export interface StatementOfOffence {
  title: string;
  welshTitle?: string;
  legislation: string;
  welshLegislation?: string;
}

export interface ReportingRestriction {
  id: string;
  judicialResultId: string;
  label: string;
  orderedDate: string;
}
