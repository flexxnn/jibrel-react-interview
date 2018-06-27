
import React from 'react';
import PropTypes from 'prop-types';

import ItemListRowDate from './ItemListRowDate';

const ItemListRow = ({ odd, rowClick, protocol, id, status, payload, style, createdAt, updatedAt }) => (
    <div style={style} className={`item-list-row ${(odd)?'odd':'even'} ${(rowClick)?'clickable':''}`} onClick={(e) => rowClick && rowClick(id, e)}>
        <div className="wrapper">
            <div className={`item-proto proto-${protocol}`}>{protocol}</div>
            <div className="line-1">
                <div className="item-payload">{payload}</div>
            </div>
            <div className="line-2">
                <div className="item-id">{id}</div>
                <ItemListRowDate createdAt={createdAt} updatedAt={updatedAt} />
            </div>
            <div className={`item-status item-status-${status}`}>{status}</div>
        </div>
    </div>
);

ItemListRow.propTypes = {
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    odd: PropTypes.bool.isRequired,
    protocol: PropTypes.oneOf(['REST', 'WS']).isRequired,
    style: PropTypes.object.isRequired,

    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    payload: PropTypes.string,
    rowClick: PropTypes.func
};

export default ItemListRow;
