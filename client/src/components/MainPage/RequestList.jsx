import React from 'react';
import { connect } from 'react-redux';

// import { toggleState } from '../../actions/applicationState';

import { List, AutoSizer } from 'react-virtualized';

import './RequestList.scss';

const rowRenderer = (items, rowClick) => ({
        index,       // Index of row
        // isScrolling, // The List is currently being scrolled
        // isVisible,   // This row is visible within the List (eg it is not an overscanned row)
        key,         // Unique key within array of rendered rows
        // parent,      // Reference to the parent List (instance)
        style,        // Style object to be applied to row (to position it);        
    }) => ( 
        <div className={`row ${(index%2)?'odd':'even'} ${(rowClick)?'clickable':''}`} 
                key={key} style={style} onClick={rowClick && rowClick(items[index].id)}>
            <div className="request-id">#{items[index].id}</div>
            <div className="request-payload">{JSON.stringify(items[index].requestPayload)}</div>
            <div className="request-status">{items[index].status}</div>
        </div>
    );

const RequestList = ({items, itemCount, onClick}) => (
    <div className="request-list">
        <AutoSizer>
            {({width, height}) => (
                <List rowRenderer={rowRenderer(items)} 
                    rowCount={itemCount}
                    rowHeight={50}
                    height={height}
                    width={width}                
                />
            )}
        </AutoSizer>
    </div>
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
