import React from 'react';
import PropTypes from 'prop-types';
import appLayout from '../decorators/appLayout';

@appLayout
export default class LandingPage extends React.Component {
  static contextTypes = { store: PropTypes.object.isRequired };
  static propTypes = {};

  render() {
    return (
      <div>
        <div className="jumbotron">
          <div className="container">
            <h1>Better Choices For The Electorate.</h1>
            <p>Let&apos;s improve democracy.</p>
            <p><a className="btn btn-primary btn-lg" role="button">Learn more &raquo;</a></p>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h2>The real power:<br />Choosing the choices</h2>
              <p>
                Two or three parties for millions of voters. Candidates chosen behind the scenes.
                Power to vote for the slightly less unacceptable choice with little say of who is on the ballot.
              </p>
            </div>
            <div className="col-md-4">
              <h2>&quot;None Of The Above&quot;</h2>
              <p>
                Whatever you put to the vote, whatever choices you give, there will always be an additional one:
                <strong>None Of The Above</strong>
                is an online voting platform and it does this, built into the system, with no possibility to override it.
              </p>
            </div>
            <div className="col-md-4">
              <h2>Distilling the best options, getting the best candidates.</h2>
              <p>
                <strong>Your election is invalid: More than half of the votes were &quot;none of the above&quot;.</strong>.
                That&apos;s how it works - if a simple majority of voters rejects all candidates, the referendum is nil and void:
                Improve the options, improve the question, then try again. With luck, eventually we&apos;ll get the best,
                most qualified people and the closest thing to what voters actually want.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
