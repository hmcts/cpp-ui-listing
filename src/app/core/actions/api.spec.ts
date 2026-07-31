import { ApiError } from './api';
import * as ApiActions from './api';

describe('Api actions', () => {

    it('Should create an ApiError action', () => {
        const action = new ApiError('Network Error');
        expect({...action}).toEqual({
            type: ApiActions.API_ERROR,
            response: 'Network Error'
        });
    });

});
