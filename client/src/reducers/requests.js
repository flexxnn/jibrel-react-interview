import actions from '../actions';

const {
    APPLICATION_EN,
    APPLICATION_DIS
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function requests(state = {
    items: [
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },   
        { type: 'REST', id: 1, requestPayload: { someGeneratedJSON: 123 }, status: 'new' },
        { type: 'REST', id: 2, requestPayload: { someGeneratedJSON: 234 }, status: 'sent' },
        { type: 'REST', id: 3, requestPayload: { someGeneratedJSON: 456 }, status: 'sent' },
        { type: 'REST', id: 4, requestPayload: { someGeneratedJSON: 678 }, status: 'success' },
        { type: 'REST', id: 5, requestPayload: { someGeneratedJSON: 910 }, status: 'failed' },                                                                     
    ]
}, action) {
    switch (action.type)
    {
        default:
            return state;
    }
}
