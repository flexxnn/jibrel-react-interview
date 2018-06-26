import actions from '../actions';

const {
    APPLICATION_EN,
    APPLICATION_DIS,
    APPLICATION_FATAL_ERROR,
    APPLICATION_STARTED,
    WS_CONNECTION_ESTABLISHED,
    WS_DISCONNECTED
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function appState(state = {
    applicationEnabled: false,
    applicationStarted: false,
    fatalError: '',
    wsConnected: false
}, action) {
    switch (action.type)
    {
        case APPLICATION_EN:
            return { ...state, applicationEnabled: true };
        case APPLICATION_DIS:
            return { ...state, applicationEnabled: false };
        case APPLICATION_STARTED:
            return { ...state, applicationStarted: true };
        case APPLICATION_FATAL_ERROR:
            return { ...state, fatalError: action.payload.fatalError };

        case WS_CONNECTION_ESTABLISHED:
            return { ...state, wsConnected: true };
        case WS_DISCONNECTED:
            return { ...state, wsConnected: false };
        default:
            return state;
    }
}
