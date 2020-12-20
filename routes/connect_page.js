var express = require('express');
var router = express.Router();

const admin = require('firebase-admin');
const multer = require('multer');
const stream = require('stream');

var serviceAccount = require('./Firebase_key.json');
const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "editor-ou9m.appspot.com"
}, "storage7");

var upload = multer({storage: multer.memoryStorage(),limits: { fieldSize: 2 * 1024 * 1024 }}
);

router.get('/', function(req, res, next){
    res.render('connect_page');
});

module.exports = router;