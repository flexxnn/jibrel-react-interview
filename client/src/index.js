import React from 'react';
import ReactDOM from 'react-dom';
import Application from './components/Application';
import registerServiceWorker from './registerServiceWorker';

import './styles/styles.scss';
import 'react-virtualized/styles.css'; // only needs to be imported once

import { logger } from './utils';
// eslint-disable-next-line
const [ log ] = logger('Web');

ReactDOM.render(<Application />, document.getElementById('root'));
registerServiceWorker();

log('Application started');
