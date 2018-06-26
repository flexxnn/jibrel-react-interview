
export const WS_PENDING_MESSAGE = 'WS_PENDING_MESSAGE';
export const WS_ITEM_POST_SUCCESS = 'WS_ITEM_POST_SUCCESS';
export const WS_ITEM_POST_ERROR = 'WS_ITEM_POST_ERROR';

export const WS_ITEM_CHECK = 'WS_ITEM_CHECK';
export const WS_ITEM_UPDATE = 'WS_ITEM_UPDATE';
export const WS_ITEM_CHECK_ERROR = 'WS_ITEM_CHECK_ERROR';

export default function(msg) {
    return {
        type: WS_PENDING_MESSAGE,
        payload: msg
    };
};

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
                updateTimestamp: +(new Date())
            }
        };
    else
        return {
            type: WS_ITEM_CHECK_ERROR,
            payload: {
                status: 'error',
                id: req.payload.id,
                updateTimestamp: +(new Date())
            }
        };
}
