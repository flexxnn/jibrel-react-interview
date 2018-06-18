import React from 'react';
import { connect } from 'react-redux';

// import { toggleState } from '../../actions/applicationState';

import { List, AutoSizer } from 'react-virtualized';

import './RequestList.scss';

const rowRenderer = (items) => ({
        index,       // Index of row
        isScrolling, // The List is currently being scrolled
        isVisible,   // This row is visible within the List (eg it is not an overscanned row)
        key,         // Unique key within array of rendered rows
        parent,      // Reference to the parent List (instance)
        style,        // Style object to be applied to row (to position it);        
    }) => ( <div className="row" key={key} style={style}>{items[index].id}</div> );

const RequestList = ({items, itemCount, onClick}) => (
    <AutoSizer>
        {({width, height}) => (
            <List rowRenderer={rowRenderer(items)} 
                rowCount={itemCount}
                rowHeight={20}
                height={height}
                width={width}                
            />
        )}
    </AutoSizer>
);

const mapStateToProps = (state) => {
    return {
        items: state.requests.items,
        itemCount: state.requests.items.length
    };
}

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestList);
