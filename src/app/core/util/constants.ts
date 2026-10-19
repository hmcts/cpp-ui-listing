import { of } from 'rxjs';

export const jurisdiction$ = of([
  { id: 'CROWN', name: 'Crown' },
  { id: 'MAGISTRATES', name: 'Magistrates' }
]);

export const PUBLIC_LIST_NOTE_MAX_LENGTH = 200;
