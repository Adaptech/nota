const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// TODO: repalce with authorization
app.get('/logout', (req, res) => res.redirect('/'));

if (process.env.NODE_ENV !== 'production') {
  require('./webpackDevServer')({ app });
  app.use(/^\/(?!api).*/, express.static(path.resolve(__dirname, '..', 'assets')));
} else {
  app.use('/', express.static(path.resolve(__dirname, '..', 'dist')));
  app.use(/^\/(?!api).*/, express.static(path.resolve(__dirname, '..', 'dist')));
}

app.listen(+process.env_PORT || 3000, () => {
  console.info('App ready and listening on port', +process.env_PORT || 3000);
});
