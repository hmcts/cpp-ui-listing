import { ComponentFixture } from '@angular/core/testing';

export const mockFixtureInputs = <T>(
  fixture: ComponentFixture<T>,
  inputRecord: Partial<Record<keyof T, unknown>>
) => {
  Object.entries(inputRecord).forEach(([inputName, inputValue]) => {
    fixture.componentRef.setInput(inputName, inputValue);
  });
};
