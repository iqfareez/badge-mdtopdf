var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Markdown to PDF', github: 'https://github.com/iqfareez/badge-mdtopdf' });
});

module.exports = router;
