
export const MODAL_ITEM_INFO = 'MODAL_ITEM_INFO';
export const MODAL_CLOSE_ALL = 'MODAL_CLOSE_ALL';

export function modalOpenItemInfo(itemId) {
    return {
        type: MODAL_ITEM_INFO,
        payload: {
            title: 'Item information',
            itemId
        }
    }
}

export function modalCloseAll() {
    return {
        type: MODAL_CLOSE_ALL
    }
}
