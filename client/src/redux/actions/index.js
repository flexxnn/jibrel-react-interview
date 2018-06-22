import * as appState from './AppStateActions';
import * as restClient from './RestClientActions';

// eslint-disable-next-line import/prefer-default-export
export default {
    ...appState,
    ...restClient
};
