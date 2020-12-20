var express = require('express');
var router = express.Router();
var badyParser = require('body-parser');

router.post('/', function(req,res,next){
   var id = req.body.id;
   var pwd = req.body.pwd;


   console.log("id: "+ id, " pwd: ", pwd);
   res.render('result_page', {title:'Express', id:id, pwd: pwd, method:"post"});
});

module.exports = router;
