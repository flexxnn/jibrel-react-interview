
export const REST_ITEM_POST_SUCCESS = 'REST_ITEM_POST_SUCCESS';
export const REST_ITEM_POST_ERROR = 'REST_ITEM_POST_ERROR';
export const REST_ITEM_POST_START = 'REST_ITEM_POST_START';

export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_UPDATE_ERROR = 'ITEM_UPDATE_ERROR';

export const WS_ITEM_POST_SUCCESS = 'WS_ITEM_POST_SUCCESS';
export const WS_ITEM_POST_ERROR = 'WS_ITEM_POST_ERROR';
export const WS_ITEM_CHECK = 'WS_ITEM_CHECK';

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

export function wsItemPostAction({req, res}) {
    if (res.success)
        return {
            type: WS_ITEM_POST_SUCCESS,
            payload: {
                type: 'WS',                
                ...req.payload,
                ...res.payload,
                updateTimestamp: +(new Date())
            }
        }
    else
        return {
            type: REST_ITEM_POST_ERROR
        };
}

export function wsItemUpdateAction(payload) {
    return {
        type: ITEM_UPDATE,
        payload: { 
            ...payload,
            updateTimestamp: +(new Date())
        }
    }
}

export function wsItemCheckAction({req, res}) {
    if (res.success)
        return {
            type: WS_ITEM_CHECK,
            payload: { 
                ...res.payload,
                updateTimestamp: +(new Date())
            }
        };
    else
        return {
            type: ITEM_UPDATE_ERROR,
            payload: {
                status: 'error',
                id: req.payload.id,
                updateTimestamp: +(new Date())
            }
        };
}