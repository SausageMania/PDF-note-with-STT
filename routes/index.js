var express = require('express');
var router = express.Router();

var mdf = require('./pdf-lib/modify');


router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/', function(req, res){
    mdf();
    res.render('index',{title:'Express'});
});

module.exports = router;