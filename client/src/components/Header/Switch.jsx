import { connect } from 'react-redux';

import { appToggleState } from '../../redux/actions/AppStateActions';

import { selectAppState } from '../../redux/StateSelectors';

import SwitchControl from '../base/SwitchControl';

const mapStateToProps = (state) => ({
        state: selectAppState(state).applicationEnabled
});

const mapDispatchToProps = (dispatch) => ({
    onClick: () => dispatch(appToggleState())
});

export default connect(mapStateToProps, mapDispatchToProps)(SwitchControl);
