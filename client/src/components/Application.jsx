import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Route, Switch } from 'react-router-dom';
// import R from '../routes';

// import InnerPage from './InnerPageLayout';
// import LoginPage from './page/login/loginPage';
import store, { history } from '../reducers';

import R from '../routes.yaml';

const Abc = () => (
    <div>aaaa</div>
);

// eslint-disable-next-line
const App = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <div className='app-container'>
                <Switch>
                    <Route {...R.ROOT} component={Abc} />
                </Switch>
            </div>
        </ConnectedRouter>
    </Provider>
);

export default App;
