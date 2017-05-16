import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import cx from 'classnames';

@withRouter
export default class Header extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  render() {
    const { history, location } = this.props;

    return (
      <Navbar inverse collapseOnSelect fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/landing">Nota</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem className={cx({ active: location.pathname.startsWith('/referendums') })} onClick={() => history.push('/referendums')} >Referendums</NavItem>
            <NavItem className={cx({ active: location.pathname.startsWith('/register') })} onClick={() => history.push('/register')} >Register</NavItem>
            <NavDropdown title="Account" id="header-nav-account-dropdown">
              <MenuItem onClick={() => { window.location = '/logout'; }}>Logout</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
