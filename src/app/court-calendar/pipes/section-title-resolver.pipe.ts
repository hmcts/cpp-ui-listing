import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sectionTitleResolver' })
export class SectionTitleResolverPipe implements PipeTransform {
  transform<T>(
    section: Record<string, any>,
    sectionTitleResolverFn: (section: Record<string, any>) => T
  ): T {
    if (!section) {
      return undefined;
    }
    return sectionTitleResolverFn(section);
  }
}
