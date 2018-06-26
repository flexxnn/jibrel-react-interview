import React from 'react';
import { connect } from 'react-redux';

// import { toggleState } from '../../actions/applicationState';

import { List, AutoSizer } from 'react-virtualized';

import ItemListRow from './ItemListRow';
import PropTypes from 'prop-types';

import { selectItemsArray } from '../../redux/StateSelectors';

import './ItemList.scss';

const rowRenderer = (items, rowClick) => ({
        index,       // Index of row
        // isScrolling, // The List is currently being scrolled
        // isVisible,   // This row is visible within the List (eg it is not an overscanned row)
        key,         // Unique key within array of rendered rows
        // parent,      // Reference to the parent List (instance)
        style,        // Style object to be applied to row (to position it);        
    }) => ( 
        <ItemListRow 
            key={key}
            style={style}
            odd={(index%2 === 0)}
            id={items[index].id}
            payload={JSON.stringify(items[index].requestPayload).substr(0, 150)}
            protocol={items[index].type}
            status={items[index].status}
            createdAt={items[index].createdAt}
            updatedAt={items[index].updatedAt}
        />
    );

const ItemList = ({items, itemCount, onRowClick}) => (
    <div className="item-list">
        <AutoSizer>
            {({width, height}) => (
                <List rowRenderer={rowRenderer(items, onRowClick)} 
                    overscanRowCount={20}
                    rowCount={itemCount}
                    rowHeight={50}
                    height={height}
                    width={width}                
                />
            )}
        </AutoSizer>
    </div>
);

ItemList.propTypes = {
    items: PropTypes.array.isRequired,
    itemCount: PropTypes.number.isRequired,
    onRowClick: PropTypes.func
}

const mapStateToProps = (state) => {
    const items = selectItemsArray(state);
    return {
        items,
        itemCount: items.length
    };
}

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
