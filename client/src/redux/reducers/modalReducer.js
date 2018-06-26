import actions from '../actions';

const {
    MODAL_ITEM_INFO,
    MODAL_CLOSE_ALL    
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function modal(state = {
    isOpened: false
}, action) {
    switch (action.type)
    {
        case MODAL_ITEM_INFO:
            return { 
                isOpened: true, 
                modalType: MODAL_ITEM_INFO,
                ...action.payload
            };

        case MODAL_CLOSE_ALL:
            return { isOpened: false };

        default:
            return state;
    }
}
