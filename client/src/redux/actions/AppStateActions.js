
export const APPLICATION_EN = 'APPLICATION_EN';
export const APPLICATION_DIS = 'APPLICATION_DIS';
export const APPLICATION_TOGGLE_STATE = 'APPLICATION_TOGGLE_STATE';
export const APPLICATION_STARTED = 'APPLICATION_STARTED';
export const APPLICATION_FATAL_ERROR = 'FATAL_ERROR';

export const APPLICATION_MODAL_ITEM_INFO = 'APPLICATION_MODAL_ITEM_INFO';
export const APPLICATION_MODAL_CLOSE_ALL = 'APPLICATION_MODAL_CLOSE_ALL';

export function appToggleState() {
    return {
        type: APPLICATION_TOGGLE_STATE
    };
}

export function appEnable() {
    return {
        type: APPLICATION_EN
    };
}

export function appDisable() {
    return {
        type: APPLICATION_DIS
    };
}

export function appSetStarted() {
    return {
        type: APPLICATION_STARTED
    };
}

export function appSetFatalError(errorText) {
    return {
        type: APPLICATION_FATAL_ERROR,
        payload: {
            fatalError: errorText
        }
    }
}

export function appOpenModalItemInfo(itemId) {
    return {
        type: APPLICATION_MODAL_ITEM_INFO,
        payload: {
            id: itemId
        }
    }
}

export function appCloseModalAll() {
    return {
        type: APPLICATION_MODAL_CLOSE_ALL
    }
}
