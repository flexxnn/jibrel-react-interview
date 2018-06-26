import React from 'react';
import ModalComponent from 'react-modal';
import PropTypes from 'prop-types';

import { selectModal } from '../../redux/StateSelectors';

import { connect } from 'react-redux';

import ModalItemInfo from './ModalItemInfo';

import actions from '../../redux/actions';

import './Modal.scss';

const {
    MODAL_ITEM_INFO,
    modalCloseAll 
} = actions;

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
}; 

const Modal = ({ isOpen, onAfterOpen, title, onCloseClick, modalType }) => (
    <ModalComponent ariaHideApp={false} isOpen={isOpen} 
        onAfterOpen={onAfterOpen} style={customStyles} shouldCloseOnOverlayClick={true}>
        <div className="modal-wrapper">
            { title && <h2>{title}</h2> }
            <div className="content">
                { (modalType === MODAL_ITEM_INFO) && <ModalItemInfo /> }
            </div>
            <div className="buttons">
                <button className="close-button" onClick={onCloseClick}>Close</button>
            </div>
        </div>
    </ModalComponent>
);

Modal.propTypes = {
    title: PropTypes.string,
    onCloseClick: PropTypes.func.isRequired,
    children: PropTypes.any,
    isOpen: PropTypes.bool.isRequired,
    onAfterOpen: PropTypes.func.isRequired,
    modalType: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => {
    const modal = selectModal(state);
    return {
        isOpen: modal.isOpened,
        modalType: modal.modalType || '',
        title: modal.title,
        ...ownProps
    };
}

const mapDispatchToProps = (dispatch, ownProps) => ({
    onCloseClick: () => {
        if (ownProps.onCloseClick)
            ownProps.onCloseClick();
        dispatch(modalCloseAll());
    },
    onAfterOpen: () => {
        if (ownProps.onAfterOpen)
            ownProps.onAfterOpen();
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
