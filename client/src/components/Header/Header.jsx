import React from 'react';

import './Header.scss';

import Switch from './Switch';

const Header = () => (
    <header>
        <div className="wrapper">
            <h1>ReqGen</h1>
            <Switch />
        </div>
    </header>
);

export default Header;
