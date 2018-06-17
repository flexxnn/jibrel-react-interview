import React from 'react';
import ReactDOM from 'react-dom';
import Application from './components/Application';
import registerServiceWorker from './registerServiceWorker';

import { logger } from './utils';
// eslint-disable-next-line
const [ log ] = logger('Web');

ReactDOM.render(<Application />, document.getElementById('root'));
registerServiceWorker();

log('Application started');
