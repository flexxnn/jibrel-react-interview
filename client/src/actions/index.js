import * as appState from './appState';
import * as restClient from './restClient';

// eslint-disable-next-line import/prefer-default-export
export default {
    ...appState,
    ...restClient
};
