import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Col } from 'react-bootstrap';

import appLayout from '../decorators/appLayout';
import ReferendumCard from '../components/referendum/Card';

@appLayout
@observer
export default class ReferendumPage extends React.Component {
  static contextTypes = { store: PropTypes.object.isRequired };
  static propTypes = {};

  render() {
    const { referendums } = this.context.store.data.referendums;

    return (
      <div className="referendums-page">
        <h1>Referendums</h1>
        <div className="pane">
          <div className="row-fluid">
            {referendums.map(x => <Col sm={6} md={3} key={x.referendumId}><ReferendumCard referendum={x} /></Col>)}
          </div>
        </div>
        <style jsx>{`
          .referendums-page { position: relative; height: 100%; }
          .referendums-page > .pane { position: absolute; top: 50px; bottom: 0; overflow-y: scroll; }
        `}</style>
      </div>
    );
  }
}
