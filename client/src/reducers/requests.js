import actions from '../actions';

const {
    APPLICATION_EN,
    APPLICATION_DIS
} = actions;

// eslint-disable-next-line import/prefer-default-export
export function requests(state = {
    items: []
}, action) {
    switch (action.type)
    {
        default:
            return state;
    }
}
