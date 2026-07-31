export interface CaseNote {
  note: string;
  author: {
    firstName: string;
    lastName: string;
  };
  id: string;
  createdDateTime: string;
  isPinned: boolean;
}
