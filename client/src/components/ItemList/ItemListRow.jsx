
import React from 'react';
import PropTypes from 'prop-types';

import './ItemListRow.scss';

const ItemListRow = ({ odd, rowClick, protocol, id, status, payload, style }) => (
    <div style={style} className={`item-list-row ${(odd)?'odd':'even'} ${(rowClick)?'clickable':''}`} onClick={(e) => rowClick && rowClick(id, e)}>
        <div className="wrapper">
            <div className={`item-proto proto-${protocol}`}>{protocol}</div>
            <div className="item-payload">{payload}</div>
            <div className="item-id">{id}</div>
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

    payload: PropTypes.string,    
    rowClick: PropTypes.func
};

export default ItemListRow;