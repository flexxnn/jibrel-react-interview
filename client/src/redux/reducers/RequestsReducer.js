import actions from '../actions';

const {
    REST_ITEM_POST_START,
    // REST_ITEM_POST_ERROR,
    REST_ITEM_POST_SUCCESS,
    WS_ITEM_POST_SUCCESS,
    
    WS_ITEM_CHECK,
    WS_ITEM_UPDATE,
    REST_ITEM_UPDATE,
    REST_ITEM_UPDATE_ERROR,
    WS_ITEM_CHECK_ERROR
} = actions;

// const items100k = [];
// for (let i = 0; i < 100000; i++)
//     items100k.push({id: 'id'+i, status: 'error'});

// eslint-disable-next-line import/prefer-default-export
export function requests(state = {
    // items: [...items100k],
    items: [],
    restErrorRequestsCount: 0,
    restSuccessRequestsCount: 0
}, action) {
    switch (action.type) {
        // case REST_ITEM_POST_ERROR:
        //     return {
        //         ...state,
        //         items: [...state.items]     
        //     };
        
        case WS_ITEM_POST_SUCCESS:
        case REST_ITEM_POST_SUCCESS:
            return {
                ...state,
                items: [
                    ...state.items,
                    { ...action.payload },
                ]
            };
        
        case WS_ITEM_CHECK:
        case WS_ITEM_UPDATE:
        case REST_ITEM_UPDATE: {
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

        case WS_ITEM_CHECK_ERROR:
        case REST_ITEM_UPDATE_ERROR: {
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
