import { connect } from 'react-redux';

import { appToggleState } from '../../redux/actions/AppStateActions';

import SwitchControl from '../base/SwitchControl';

const mapStateToProps = (state) => ({
        state: state.appState.applicationEnabled
});

const mapDispatchToProps = (dispatch) => ({
    onClick: () => dispatch(appToggleState())
});

export default connect(mapStateToProps, mapDispatchToProps)(SwitchControl);
