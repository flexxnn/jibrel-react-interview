import actions from '../actions';

const {
    // REST_ITEM_POST_START,
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
export function requests(state = [], action) 
{
    switch (action.type) 
    {       
        case WS_ITEM_POST_SUCCESS:
        case REST_ITEM_POST_SUCCESS:
            return [
                ...state,
                { ...action.payload },
            ];
        
        case WS_ITEM_CHECK:
        case WS_ITEM_UPDATE:
        case WS_ITEM_CHECK_ERROR:
        case REST_ITEM_UPDATE_ERROR:        
        case REST_ITEM_UPDATE:
            return state.map(item => 
                (item.id === action.payload.id) ?
                    { ...item, ...action.payload }
                    : item
            );

        default:
            return state;
    }
}
