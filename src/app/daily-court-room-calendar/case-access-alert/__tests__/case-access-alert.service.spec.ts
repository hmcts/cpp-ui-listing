import { TestBed } from '@angular/core/testing';
import { CaseAccessAlertService } from '../case-access-alert.service';

describe('CaseAccessAlertService', () => {
  let service: CaseAccessAlertService;

  const nativeDate = Date.now;

  // there are some problems spying and setting/removing values with the new JSDom
  // so we need to create our own implementation of localStorage in order to tackle
  // those issues:
  //
  // https://stackoverflow.com/posts/54157998/revisions
  //
  const localStorageMock = (function () {
    let store = {};

    return {
      getItem(key) {
        return store[key];
      },

      setItem(key, value) {
        store[key] = value;
      },

      clear() {
        store = {};
      },

      removeItem(key) {
        delete store[key];
      },

      getAll() {
        return store;
      }
    };
  })();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaseAccessAlertService],
      teardown: { destroyAfterEach: false }
    });

    service = TestBed.inject(CaseAccessAlertService);
    global.Date.now = jest.fn(() => new Date('2020-02-07T10:20:30Z').getTime());
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    jest.spyOn(window.localStorage, 'setItem');
    jest.spyOn(window.localStorage, 'removeItem');
  });

  afterAll(() => {
    global.Date.now = nativeDate;
  });

  it('should show modal if no item on storage', () => {
    expect(service.shouldShowModal(['h1', 'h2'], 'userId')).toBeTruthy();
  });

  it('should save the decision', () => {
    service.saveDecision(['h1', 'h2'], 'userId');
    expect(localStorage.getItem('accessAlert')).toMatchSnapshot();
  });

  it('should reset values', () => {
    service.saveDecision(['h1', 'h2'], 'userId');
    global.Date.now = jest.fn(() => new Date('2020-02-08T10:20:30Z').getTime());
    service.shouldShowModal(['h1', 'h2'], 'userId');
    expect(window.localStorage.removeItem).toHaveBeenCalled();
    expect(window.localStorage.getItem('accessAlert')).toBe(undefined);
  });

  it('should not show modal is selected id is not in todays hearing values', () => {
    expect(service.shouldShowModal(['h1', 'h2'], 'userId', 'h3')).toBeFalsy();
  });

  it('should not show modal when selected id is set and in storage', () => {
    service.saveDecision(['h1', 'h2'], 'userId');
    expect(service.shouldShowModal(['h1', 'h2'], 'userId', 'h1')).toBeFalsy();
  });

  it('should show modal when selected id is set and not in storage', () => {
    service.saveDecision(['h1', 'h2'], 'userId');
    expect(service.shouldShowModal(['h1', 'h2', 'h3'], 'userId', 'h3')).toBeTruthy();
  });

  it('should reset for different user', () => {
    service.saveDecision(['h1', 'h2'], 'userId');
    const result = service.shouldShowModal(['h3'], 'userId2');

    expect(result).toBeTruthy();
    expect(window.localStorage.removeItem).toHaveBeenCalled();
    expect(window.localStorage.getItem('accessAlert')).toBe(undefined);
  });

  it('should add more hearing ids', () => {
    service.saveDecision(['h1', 'h2'], 'userId');
    service.saveDecision(['h3'], 'userId2');

    expect(window.localStorage.getItem('accessAlert')).toMatchSnapshot();
  });
});
