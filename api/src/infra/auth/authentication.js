export default services => {
  const {app} = services;

  // redirect to the oauth2 sign_in page
  app.get('/logout', (req, res) => res.redirect('/oauth2/sign_in'));
}
