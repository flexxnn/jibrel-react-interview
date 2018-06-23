import actions from '../actions';
import { combineReducers } from 'redux';

const {
    WS_PENDING_MESSAGE
} = actions;

function pendingItems(state = [], action) {
    switch (action.type)
    {
        case WS_PENDING_MESSAGE:
            return [...state, action.payload];

        //     return { ...state, applicationEnabled: true };
        // case APPLICATION_DIS:
        //     return { ...state, applicationEnabled: false };
        // case APPLICATION_STARTED:
        //     return { ...state, applicationStarted: true };
        // case APPLICATION_FATAL_ERROR:
        //     return { ...state, fatalError: action.payload.fatalError };
        default:
            return state;
    }
}

function items(state = [], action) {
    switch (action.type) {
        default:
            return state;
    }
}

const ws = combineReducers({
    pendingItems,
    items
});

// eslint-disable-next-line import/prefer-default-export
export default ws;
