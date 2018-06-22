
export const REST_ITEM_POST_SUCCESS = 'REST_ITEM_POST_SUCCESS';
export const REST_ITEM_POST_ERROR = 'REST_ITEM_POST_ERROR';
export const REST_ITEM_POST_START = 'REST_ITEM_POST_START';

export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_UPDATE_ERROR = 'ITEM_UPDATE_ERROR';

export function restItemPostSuccess(successPayload) {
    return {
        type: REST_ITEM_POST_SUCCESS,
        payload: { 
            ...successPayload.res,
            type: 'REST'
        }
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

export function restItemUpdate(successPayload) {
    return {
        type: ITEM_UPDATE,
        payload: { 
            ...successPayload.res,
            updateTimestamp: +(new Date())
        }
    }
}

export function restItemUpdateError(e) {
    return {
        type: ITEM_UPDATE_ERROR,
        payload: {
            status: 'error',
            error: e.res,
            id: e.req.id,
            updateTimestamp: +(new Date())
        }
    }
}