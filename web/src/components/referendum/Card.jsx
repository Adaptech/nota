import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

@observer
export default class ReferendumCard extends React.Component {
  static propTypes = { referendum: PropTypes.object.isRequired };

  render() {
    const { referendum } = this.props;

    return (
      <div className="well referendum-card">
        <div className="title">{referendum.name}</div>
        <div>{referendum.proposal}</div>
        <style jsx>{`
          .referendum-card { height: 200px; }
          .referendum-card .title { font-weight: bold; }
        `}</style>
      </div>
    );
  }
}

        // <div>{referendum.options}</div>
