import actions from '../actions';

const {
    APPLICATION_EN,
    APPLICATION_DIS
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function applicationState(state = {
    applicationEnabled: false,
    requestInterval: 1000
}, action) {
    switch (action.type)
    {
        case APPLICATION_EN:
            return { ...state, applicationEnabled: true };
        case APPLICATION_DIS:
            return { ...state, applicationEnabled: false };
        default:
            return state;
    }
}
