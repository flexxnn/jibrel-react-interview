export const WS_CONNECTION_ESTABLISHED = 'WS_CONNECTION_ESTABLISHED';
export const WS_DISCONNECTED = 'WS_DISCONNECTED';

export const WS_PENDING_MESSAGE = 'WS_PENDING_MESSAGE';
export const WS_ITEM_POST_SUCCESS = 'WS_ITEM_POST_SUCCESS';
export const WS_ITEM_POST_ERROR = 'WS_ITEM_POST_ERROR';

export const WS_ITEM_CHECK = 'WS_ITEM_CHECK';
export const WS_ITEM_UPDATE = 'WS_ITEM_UPDATE';
export const WS_ITEM_CHECK_ERROR = 'WS_ITEM_CHECK_ERROR';

export function wsConnEstablishedAction() { 
    return { 
        type: WS_CONNECTION_ESTABLISHED 
    };
};

export function wsDisconnetedAction() {
    return { 
        type: WS_DISCONNECTED 
    };
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
            type: WS_ITEM_POST_ERROR
        };
}

export function wsItemUpdateAction(payload) {
    return {
        type: WS_ITEM_UPDATE,
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
                id: req.payload.id,
                updateTimestamp: +(new Date())
            }
        };
    else
    {
        return {
            type: WS_ITEM_CHECK_ERROR,
            payload: {
                status: 'error',
                error: res,
                id: req.payload.id,
                updateTimestamp: +(new Date())
            }
        };
    }
}
