import React from 'react';

import ItemList from '../ItemList';

import Header from '../Header';
import Modal from '../Modal';

const MainPage = () => (
    <React.Fragment>
        <Header />
        <div className="content">
            <ItemList />
        </div>
        <Modal />
    </React.Fragment>
);

export default MainPage;