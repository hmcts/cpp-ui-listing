import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { signalStore } from '@ngrx/signals';
import { withErrorHandlerAdapter } from '../with-error-handler-adapter.feature';
import { AppState, ApiError } from '../../../core';

describe('withErrorHandlerAdapter', () => {
  const TestStore = signalStore(withErrorHandlerAdapter());
  let store: InstanceType<typeof TestStore>;
  let mockGlobalStore: MockStore<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestStore,
        provideMockStore<AppState>({
          initialState: {} as AppState
        })
      ],
      teardown: { destroyAfterEach: false }
    });

    store = TestBed.inject(TestStore);
    mockGlobalStore = TestBed.inject(Store) as MockStore<AppState>;

    jest.spyOn(mockGlobalStore, 'dispatch');
    jest.clearAllMocks();
  });

  describe('handleError method', () => {
    it('should exist as a method', () => {
      expect(typeof store.handleError).toBe('function');
    });

    it('should dispatch ApiError action with HttpErrorResponse', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Something went wrong' },
        url: '/api/test'
      });

      store.handleError(errorResponse);

      expect(mockGlobalStore.dispatch).toHaveBeenCalledTimes(1);
      expect(mockGlobalStore.dispatch).toHaveBeenCalledWith(new ApiError(errorResponse));
    });

    it('should handle different HTTP error statuses', () => {
      const error404 = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Resource not found' },
        url: '/api/missing'
      });

      const error401 = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Access denied' },
        url: '/api/secured'
      });

      store.handleError(error404);
      expect(mockGlobalStore.dispatch).toHaveBeenCalledWith(new ApiError(error404));

      jest.clearAllMocks();

      store.handleError(error401);
      expect(mockGlobalStore.dispatch).toHaveBeenCalledWith(new ApiError(error401));
    });

    it('should handle HttpErrorResponse with no error body', () => {
      const errorResponse = new HttpErrorResponse({
        status: 503,
        statusText: 'Service Unavailable',
        url: '/api/service'
      });

      store.handleError(errorResponse);

      expect(mockGlobalStore.dispatch).toHaveBeenCalledWith(new ApiError(errorResponse));
    });

    it('should handle multiple error calls', () => {
      const error1 = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid input' }
      });

      const error2 = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' }
      });

      store.handleError(error1);
      store.handleError(error2);

      expect(mockGlobalStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockGlobalStore.dispatch).toHaveBeenNthCalledWith(1, new ApiError(error1));
      expect(mockGlobalStore.dispatch).toHaveBeenNthCalledWith(2, new ApiError(error2));
    });

    it('should preserve error response properties', () => {
      const originalError = new HttpErrorResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        error: {
          message: 'Validation failed',
          details: ['Field is required', 'Invalid format']
        },
        url: '/api/validate'
      });

      store.handleError(originalError);

      const dispatchedAction = (mockGlobalStore.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchedAction).toBeInstanceOf(ApiError);
      expect(dispatchedAction.response).toBe(originalError);
    });
  });

  describe('integration with global store', () => {
    it('should work with different AppState configurations', () => {
      const customState: Partial<AppState> = {
        auth: { user: { id: '123' } }
      } as any;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TestStore,
          provideMockStore<AppState>({
            initialState: customState as AppState
          })
        ],
        teardown: { destroyAfterEach: false }
      });

      const newStore = TestBed.inject(TestStore);
      const newGlobalStore = TestBed.inject(Store) as MockStore<AppState>;
      jest.spyOn(newGlobalStore, 'dispatch');

      const errorResponse = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden'
      });

      newStore.handleError(errorResponse);

      expect(newGlobalStore.dispatch).toHaveBeenCalledWith(new ApiError(errorResponse));
    });
  });

  describe('snapshot testing', () => {
    it('should match method signature snapshot', () => {
      const methodInfo = {
        methodName: 'handleError',
        methodType: typeof store.handleError,
        methodExists: 'handleError' in store
      };

      expect(methodInfo).toMatchSnapshot();
    });
  });
});
