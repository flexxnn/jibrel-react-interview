import { logger } from '../utils';
// eslint-disable-next-line
const [ log, error, warn ]= logger('actions/appearance');

export const SHOW_MOBILE_MENU = 'SHOW_MOBILE_MENU';
export const HIDE_MOBILE_MENU = 'HIDE_MOBILE_MENU';

export function showMobileMenu() {
    return {
        type: SHOW_MOBILE_MENU
    };
}

export function hideMobileMenu() {
    return {
        type: HIDE_MOBILE_MENU
    };
}

export function toggleMobileMenu() {
    return (dispatch, getState) => {
        const { mobileMenuVisible } = getState().appearance;
        if (mobileMenuVisible)
            dispatch(hideMobileMenu());
        else
            dispatch(showMobileMenu());
    };
}
