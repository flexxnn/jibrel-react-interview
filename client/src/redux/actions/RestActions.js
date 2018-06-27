
export const REST_ITEM_POST_SUCCESS = 'REST_ITEM_POST_SUCCESS';
export const REST_ITEM_POST_ERROR = 'REST_ITEM_POST_ERROR';
export const REST_ITEM_POST_START = 'REST_ITEM_POST_START';

export const REST_ITEM_UPDATE = 'REST_ITEM_UPDATE';
export const REST_ITEM_UPDATE_ERROR = 'REST_ITEM_UPDATE_ERROR';

export function restItemPostSuccess({ req, res }) {
    return {
        type: REST_ITEM_POST_SUCCESS,
        payload: { 
            requestPayload: req.body.requestPayload,
            ...res,            
            type: 'REST'
        }
    }
}

export function restItemPostError(e) {
    return {
        type: REST_ITEM_POST_ERROR,
        payload: {
            error: e
        }
    };
}

export function restItemPostStart() {
    return {
        type: REST_ITEM_POST_START
    }
}

export function restItemUpdate(successPayload) {
    return {
        type: REST_ITEM_UPDATE,
        payload: { 
            ...successPayload.res,
            updateTimestamp: +(new Date())
        }
    }
}

export function restItemUpdateError(e) {
    return {
        type: REST_ITEM_UPDATE_ERROR,
        payload: {
            status: 'error',
            error: e.res,
            id: e.req.id,
            updateTimestamp: +(new Date())
        }
    }
}
