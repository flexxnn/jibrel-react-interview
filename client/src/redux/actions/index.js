import * as appState from './AppStateActions';
import * as restClient from './RestActions';
import * as ws from './WSActions';
import * as modal from './modalActions';

// eslint-disable-next-line import/prefer-default-export
export default {
    ...appState,
    ...restClient,
    ...ws,
    ...modal
};
