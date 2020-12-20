var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('viewer');
});

router.post('/', function(req, res){
    res.render('viewer');
});

module.exports = router;