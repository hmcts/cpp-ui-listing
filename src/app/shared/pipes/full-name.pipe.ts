import { Pipe, PipeTransform } from '@angular/core';
import { Defendant } from '../../core';

@Pipe({ name: 'fullName' })
export class FullNamePipe implements PipeTransform {
  transform(defendant: Defendant, attribute: string = null): string {
    if (!defendant) {
      return '';
    }
    switch (attribute) {
      case 'firstName':
        return (
          (defendant.firstName &&
            defendant.firstName.charAt(0).toUpperCase() +
              defendant.firstName.slice(1).toLowerCase()) ||
          ''
        );
      case 'lastName':
        return (defendant.lastName && defendant.lastName.toUpperCase()) || '';
      case 'organisationName':
        return defendant.organisationName && defendant.organisationName.toUpperCase();
      default:
        if (!defendant.firstName && !defendant.organisationName) {
          return '';
        }
        return defendant.firstName
          ? defendant.firstName.charAt(0).toUpperCase() +
              defendant.firstName.slice(1).toLowerCase() +
              ' ' +
              defendant.lastName.toUpperCase()
          : defendant.organisationName.toUpperCase();
    }
  }
}
