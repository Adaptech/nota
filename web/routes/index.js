var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'NOTA - Better Choices, One Democracy At The Time' });
});

module.exports = router;
