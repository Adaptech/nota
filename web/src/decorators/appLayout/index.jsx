import React from 'react';
import PropTypes from 'prop-types';

import Header from './Header';
import Footer from './Footer';

class AppLayout extends React.Component {
  static propTypes = { children: PropTypes.any };

  render() {
    return (
      <div>
        <Header />
        <div className="content-wrapper">
          <div className="content-wrapper2">
            { this.props.children }
          </div>
          <style jsx>{`
            .content-wrapper { position: absolute; top: 50px; bottom: 30px; width: 100%; }
            .content-wrapper > .content-wrapper2 { display: inline-block; position: relative; height: 100%; width: 100%; }
          `}</style>
        </div>
        <Footer />
      </div>
    );
  }
}

export default (Component) => {
  const C = props => (
    <AppLayout>
      <Component {...props} />
    </AppLayout>
  );
  C.displayName = `appLayout(${Component.displayName || Component.name})`;
  return C;
};
