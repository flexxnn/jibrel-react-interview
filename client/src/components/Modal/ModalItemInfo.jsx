import React from 'react';

import { selectModal, selectItem } from '../../redux/StateSelectors';
import { connect } from 'react-redux';

class ModalItemInfo extends React.Component {
    // constructor() {
    //     super();
    // }

    render() {
        if (this.props.notFound)
            return (
                <div className="item-info">
                    <div className="error">Item not found</div>
                </div>
            );

        return (
            <div className="item-info">
                <div className="info-row"><strong>ID</strong> <span>{this.props.id}</span></div>
                <div className="info-row"><strong>Type</strong> <span className={`item-type item-type-${this.props.type}`}>{this.props.type}</span></div>
                <div className="info-row"><strong>Status</strong> <span className={`item-status item-status-${this.props.status}`}>{this.props.status}</span></div>
                <div className="info-row"><strong>Created at</strong> <span>{(new Date(this.props.createdAt)).toLocaleTimeString('en-US')}</span></div>
                { this.props.updatedAt && 
                    <div className="info-row"><strong>Updated at</strong> <span>{(new Date(this.props.updatedAt)).toLocaleTimeString('en-US')}</span></div> }
                <div className="info-row request-payload">
                    <strong>Request payload</strong>
                    <textarea readOnly={true} value={JSON.stringify(this.props.requestPayload, false, 4)}></textarea>
                </div>
                { this.props.result && <div className="info-row result">
                    <strong>Result</strong>
                    <textarea readOnly={true} value={JSON.stringify(this.props.result, false, 4)}></textarea>
                </div> }
                { this.props.error && <div className="info-row errors">
                    <strong>Error</strong>
                    <textarea readOnly={true} value={JSON.stringify(this.props.error, false, 4)}></textarea>
                </div> }
            </div>
        );
    }
}

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