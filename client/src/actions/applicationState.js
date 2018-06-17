import { logger } from '../utils';
// eslint-disable-next-line
const [ log, error, warn ]= logger('actions/applicationState');

export const APPLICATION_EN = 'APPLICATION_EN';
export const APPLICATION_DIS = 'APPLICATION_DIS';
export const APPLICATION_TOGGLE_STATE = 'APPLICATION_TOGGLE_STATE';

export function toggleState() {
    return {
        type: APPLICATION_TOGGLE_STATE
    }
}
