import actions from '../actions';

const {
    REST_ITEM_POST_START,
    REST_ITEM_POST_ERROR,
    REST_ITEM_POST_SUCCESS,
    ITEM_UPDATE,
    ITEM_UPDATE_ERROR
} = actions;

// const items100k = [];
// for (let i = 0; i < 100000; i++)
//     items100k.push({id: 'id'+i, status: 'error'});

// eslint-disable-next-line import/prefer-default-export
export function requests(state = {
    // items: [...items100k],
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
                    ...state.items,
                    { ...action.payload },
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

        case ITEM_UPDATE_ERROR: {
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
