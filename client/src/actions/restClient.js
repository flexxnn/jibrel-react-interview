import { logger } from '../utils';
// eslint-disable-next-line
const [ log, error, warn ]= logger('actions/applicationState');

export const REST_ITEM_POST_SUCCESS = 'REST_ITEM_POST_SUCCESS';
export const REST_ITEM_POST_ERROR = 'REST_ITEM_POST_ERROR';
export const REST_ITEM_POST_START = 'REST_ITEM_POST_START';

export function restItemPostSuccess(postedItem) {
    return {
        type: REST_ITEM_POST_SUCCESS,
        payload: postedItem
    }
}

export function restItemPostError(e) {
    return {
        type: REST_ITEM_POST_ERROR,
        payload: e
    };
}

export function restItemPostStart() {
    return {
        type: REST_ITEM_POST_START
    }
}
