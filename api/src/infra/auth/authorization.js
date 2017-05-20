export default services => {
  const { app, readRepository, logger} = services;

  // look up the user
  app.use(async (req, res, next) => {
    try {
      const xidId = req.headers['x-user'];
      if (xidId) req.user = await readRepository.findOne('budtender', {xidId}, true);
      if (!xidId) return res.status(401).json({message: 'Unknown user'});
      if (!req.user) return res.status(403).json({message: 'Forbidden'});
      next();
    } catch(err) {
      logger.error(err.stack);
      res.status(500).json({message: err.message});
    }
  });
}
