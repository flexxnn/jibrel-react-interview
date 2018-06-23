
export const WS_PENDING_MESSAGE = 'WS_PENDING_MESSAGE';

export default function(msg) {
    return {
        type: WS_PENDING_MESSAGE,
        payload: msg
    };
};


