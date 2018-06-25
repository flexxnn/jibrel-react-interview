import React from 'react';

import ItemList from '../ItemList';

import './MainPage.scss';
import Header from '../Header';

const MainPage = () => (
    <React.Fragment>
        <Header />
        <div className="content">
            <ItemList />
        </div>
    </React.Fragment>
);

export default MainPage;