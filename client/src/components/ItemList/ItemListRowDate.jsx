import React from 'react';
import PropTypes from 'prop-types';

const ItemListRowDate = ({ createdAt, updatedAt }) => (
    <div className="item-date">{
        (createdAt && !updatedAt && `Created at ${(new Date(createdAt)).toLocaleTimeString('en-US')}`) ||
        (updatedAt && `Updated at ${(new Date(updatedAt)).toLocaleTimeString('en-US')}`)
    }</div>
);

ItemListRowDate.propTypes = {
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
};

export default ItemListRowDate;
