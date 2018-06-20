import actions from '../actions';

const {
    REST_ITEM_POST_START,
    REST_ITEM_POST_ERROR,
    REST_ITEM_POST_SUCCESS,
    ITEM_UPDATE
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function requests(state = {
    items: [],
    restErrorCount: 0,
    restRequestCount: 0
}, action) {
    switch (action.type) {
        case REST_ITEM_POST_ERROR:
            return {
                ...state,
                items: [...state.items],
                restErrorCount: state.restErrorCount + 1,
                restRequestCount: state.restRequestCount + 1                
            };
        
        case REST_ITEM_POST_SUCCESS:
            return {
                ...state,
                items: [
                    { type: 'REST', ...action.payload },
                    ...state.items
                ],
                restRequestCount: state.restRequestCount + 1
            };
        
        case ITEM_UPDATE: {
            // find the item
            const itemIndex = state.items.findIndex((item) => item.id === action.payload.id);
            return {
                ...state,
                items: [...state.items.slice(0, itemIndex), // items before
                    { ...state.items[itemIndex], ...action.payload }, // this item
                    ...state.items.slice(itemIndex+1) // items after
                ]
            };
        }
        
        case REST_ITEM_POST_START:
        default:
            return state;
    }
}
