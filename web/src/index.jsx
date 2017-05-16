import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import createProvider from 'react-create-provider';
import { BrowserRouter as Router } from 'react-router-dom';

import Store from './store';
import createRoutes from './createRoutes';

const Provider = createProvider({ store: PropTypes.object.isRequired });
const store = new Store();

ReactDOM.render(
  <Provider store={store}>
    <Router>{createRoutes()}</Router>
  </Provider>,
  document.getElementById('root'),
);
