export default (user) => {
  console.warn(`Faking proxy oauth server with x-user: ${JSON.stringify(user)}`);
  return (req, res, next) => {
    if (req.url.startsWith('/oauth2/sign_in')) return res.redirect('/'); 
    req.headers['x-user'] = user;
    next();
  };
}
