import React from 'react';
import PropTypes from 'prop-types';

import { selectModal, selectItem } from '../../redux/StateSelectors';
import { connect } from 'react-redux';

const ModalItemInfo = ({ notFound, id, type, status, createdAt, updatedAt, requestPayload, result, error }) => (
    <div className="item-info">
        { notFound && <div className="error">Item not found</div> }
        { !notFound && 
        <React.Fragment>
            <div className="info-row"><strong>ID</strong> <span>{id}</span></div>
            <div className="info-row"><strong>Type</strong> <span className={`item-type item-type-${type}`}>{type}</span></div>
            <div className="info-row"><strong>Status</strong> <span className={`item-status item-status-${status}`}>{status}</span></div>
            <div className="info-row"><strong>Created at</strong> <span>{(new Date(createdAt)).toLocaleTimeString('en-US')}</span></div>
            { updatedAt && 
                <div className="info-row"><strong>Updated at</strong> <span>{(new Date(updatedAt)).toLocaleTimeString('en-US')}</span></div> }
            <div className="info-row request-payload">
                <strong>Request payload</strong>
                <textarea readOnly={true} value={JSON.stringify(requestPayload, false, 4)}></textarea>
            </div>
            { result && <div className="info-row result">
                <strong>Result</strong>
                <textarea readOnly={true} value={JSON.stringify(result, false, 4)}></textarea>
            </div> }
            { error && <div className="info-row errors">
                <strong>Error</strong>
                <textarea readOnly={true} value={JSON.stringify(error, false, 4)}></textarea>
            </div> }
        </React.Fragment> }
    </div>
);

ModalItemInfo.propTypes = {
    notFound: PropTypes.bool, 
    id: PropTypes.string, 
    type: PropTypes.string, 
    status:PropTypes.string, 
    createdAt: PropTypes.string, 
    updatedAt: PropTypes.string, 
    requestPayload: PropTypes.object, 
    result: PropTypes.object, 
    error: PropTypes.object
};

ModalItemInfo.defaultProps = {
    notFound: false
};

const mapStateToProps = (state) => {
    const modal = selectModal(state);
    const item = selectItem(state, modal.itemId) || { notFound: true };
    return {
        ...item
    };
}

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalItemInfo);