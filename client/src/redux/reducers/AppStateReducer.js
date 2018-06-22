import actions from '../actions';

const {
    APPLICATION_EN,
    APPLICATION_DIS,
    APPLICATION_FATAL_ERROR,
    APPLICATION_STARTED
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function appState(state = {
    applicationEnabled: false,
    applicationStarted: false,
    fatalError: ''
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
        default:
            return state;
    }
}
