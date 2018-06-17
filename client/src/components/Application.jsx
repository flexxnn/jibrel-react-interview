import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Route, Switch } from 'react-router-dom';
// import R from '../routes';

import MainPage from './MainPage';
// import LoginPage from './page/login/loginPage';
import store, { history } from '../reducers';

import R from '../routes.yaml';

// eslint-disable-next-line
const App = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <div className='app-container'>
                <Switch>
                    <Route {...R.ROOT} component={MainPage} />
                </Switch>
            </div>
        </ConnectedRouter>
    </Provider>
);

export default App;
