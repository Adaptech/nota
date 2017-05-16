import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import LandingPage from './pages/landing';
import ReferendumsPage from './pages/referendums';
import RegisterPage from './pages/register';

const NotFoundPage = () => <div>Not Found</div>;

export default () => (
  <Switch>
    <Redirect from="/" exact to="/landing" />
    <Route path="/landing" component={LandingPage} />
    <Route path="/referendums" component={ReferendumsPage} />
    <Route path="/register" component={RegisterPage} />
    <Route path="*" component={NotFoundPage} />
  </Switch>
);
