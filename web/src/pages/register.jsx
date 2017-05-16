import React from 'react';
import PropTypes from 'prop-types';
import appLayout from '../decorators/appLayout';

@appLayout
export default class RegisterPage extends React.Component {
  static contextTypes = { store: PropTypes.object.isRequired };
  static propTypes = {};

  render() {
    return (
      <div>
        <h1>Voter registration</h1>
      </div>
    );
  }
}
