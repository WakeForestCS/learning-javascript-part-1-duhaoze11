var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname +'/game.html');
  res.sendFile(__dirname + '/game0.js');
});

module.exports = router;
