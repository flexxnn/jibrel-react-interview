import actions from '../actions';

const {
    SHOW_MOBILE_MENU,
    HIDE_MOBILE_MENU
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function appearance(state = {
    mobileMenuVisible: false,
    messagingCenterVisible: false
}, action) {
    switch (action.type)
    {
        case SHOW_MOBILE_MENU:
            return { ...state, mobileMenuVisible: true };
        case HIDE_MOBILE_MENU:
            return { ...state, mobileMenuVisible: false };
        default:
            return state;
    }
}
