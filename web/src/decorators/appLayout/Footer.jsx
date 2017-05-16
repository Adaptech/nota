import React from 'react';

export default class Header extends React.Component {
  render() {
    return (
      <footer>
        <p><a href="https://github.com/Adaptech/nota">NOTA is free and Open Source.</a></p>
        <style jsx>{'footer { position: absolute; bottom: 0; width: 100%; height: 30px; background-color: #f5f5f5; }'}</style>
      </footer>
    );
  }
}
