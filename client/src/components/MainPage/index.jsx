import React from 'react';

import Switch from './Switch';
import RequestList from './RequestList';

import './MainPage.scss';

const MainPage = () => (
    <React.Fragment>
        <div className="header">
            <Switch />
        </div>
        <div className="content">
            <RequestList />
        </div>
    </React.Fragment>
);

export default MainPage;