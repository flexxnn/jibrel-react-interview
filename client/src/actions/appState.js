import { logger } from '../utils';
// eslint-disable-next-line
const [ log, error, warn ]= logger('actions/applicationState');

export const APPLICATION_EN = 'APPLICATION_EN';
export const APPLICATION_DIS = 'APPLICATION_DIS';
export const APPLICATION_TOGGLE_STATE = 'APPLICATION_TOGGLE_STATE';
export const APPLICATION_STARTED = 'APPLICATION_STARTED';
export const APPLICATION_FATAL_ERROR = 'FATAL_ERROR';

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
    error(`Application fatal error ${errorText}`);
    return {
        type: APPLICATION_FATAL_ERROR,
        payload: {
            fatalError: errorText
        }
    }
}