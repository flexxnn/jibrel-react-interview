import React from 'react';
import PropTypes from 'prop-types'
import Switch from 'react-toggle-switch';

import './SwitchControl.scss';

const SwitchControl = ({state, onClick}) => (
    <div className="switch-control">
        <Switch onClick={onClick} on={state} />
    </div>
);

SwitchControl.propTypes = {
    state: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};

export default SwitchControl;