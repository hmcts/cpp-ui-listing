import { Pipe, PipeTransform } from '@angular/core';
import { RotaBusinessType, RotaBusinessTypeCode } from '@cpp/reference-data';

@Pipe({
  name: 'businessTypeDescriptionByCode'
})
export class BusinessTypeDescriptionByCodePipe implements PipeTransform {
  transform(businesstypeCode: RotaBusinessTypeCode, rotaBusinessTypes: RotaBusinessType[]): string {
    if (businesstypeCode) {
      return (
        (rotaBusinessTypes ?? []).find(({ typeCode }) => typeCode === businesstypeCode)
          ?.typeDescription ?? ''
      );
    }
    return '';
  }
}
