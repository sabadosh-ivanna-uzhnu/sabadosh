var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/wat", function (req, res, next) {
  res.send(
    "Csörögefánk are wonderful light as air, crispy, fried dough cookies"
  );
});

module.exports = router;
