import { NetworkConnectivityAction, NETWORK_CONNECTIVITY } from './network-connectivity.actions';

describe('Network Connectivity actions', () => {

    it('Should create a NetworkConnectivityAction action', () => {
        const action = new NetworkConnectivityAction(true);
        expect({...action}).toEqual({
            type: NETWORK_CONNECTIVITY,
            online: true
        });
    });

});
