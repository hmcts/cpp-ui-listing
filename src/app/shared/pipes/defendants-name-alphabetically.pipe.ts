import { Pipe, PipeTransform } from '@angular/core';
import { Defendant } from '../../core';
import { sortBy } from 'lodash-es';

@Pipe({ name: 'defendantsNameAlphabetically' })
export class DefendantsNameAlphabeticallyPipe implements PipeTransform {
  transform(defendants: Defendant[]): string {
    const names = sortBy(defendants, ['organisationName', 'firstName']).map((defendant) => {
      if (defendant.firstName && defendant.lastName) {
        return `${defendant.firstName} ${defendant.lastName.toUpperCase()}`;
      }
      if (defendant.organisationName) {
        return defendant.organisationName;
      }
    });

    return names.join(', ');
  }
}
