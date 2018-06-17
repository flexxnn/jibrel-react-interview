import React from 'react';
import { connect } from 'react-redux';

import { toggleState } from '../../actions/applicationState';

import './Switch.scss';

const SwitchControl = ({state, onClick}) => (
    <button className={`switch-${(state === true) ? 'on' : 'off'}`} onClick={onClick}>{(state === true) ? 'Switch off' : 'Switch on'}</button>
);

const mapStateToProps = (state) => {
    return {
        state: state.applicationState.applicationEnabled
    };
}

const mapDispatchToProps = (dispatch) => ({
    onClick: () => dispatch(toggleState())
});

export default connect(mapStateToProps, mapDispatchToProps)(SwitchControl);
