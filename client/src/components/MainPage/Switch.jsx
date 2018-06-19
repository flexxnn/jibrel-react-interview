import React from 'react';
import { connect } from 'react-redux';

import { appToggleState } from '../../actions/appState';

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
    onClick: () => dispatch(appToggleState())
});

export default connect(mapStateToProps, mapDispatchToProps)(SwitchControl);
