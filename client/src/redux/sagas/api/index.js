import * as rest from './RestAPISaga';
import * as ws from './WebsocketSaga';

export default {
    ...rest,
    ...ws
};