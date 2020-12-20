var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');
const os = require('os');
const admin = require('firebase-admin');
const multer = require('multer');
const stream = require('stream');
const pdf2base64 = require('pdf-to-base64');
const fetch = require('cross-fetch');
const decodeURIComponent = require('decode-uri-component');
const atob = require('atob');
const btoa = require('btoa');


var memo = require('./pdf-lib/memo.js');
var makeMemoOri = require('./pdf-lib/makeMemoOri.js')
var makeMemoCop = require('./pdf-lib/makeMemoCop.js');
var deletePage = require('./pdf-lib/deletePage.js')
var copyPage = require('./pdf-lib/copyPage.js');

var serviceAccount = require('./Firebase_key.json');
const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "editor-ou9m.appspot.com"
}, "storage");

var upload = multer({storage: multer.memoryStorage(),limits: { fieldSize: 2 * 1024 * 1024 }}
);

router.get('/upload', function(req, res, next){
    var fileRef = firebaseAdmin.storage().bucket();
    var pdflist = [];
    var created_list = [];
    var updated_list = [];
    fileRef.getFiles({prefix:""}, function(err,files) {
        files.forEach(function (file) {
            var name = file.name;
            if (name != "original/" && name.includes(".pdf") && name.includes("original/")) {
                var timeCreated = file.metadata.timeCreated;
                var updated = file.metadata.updated;

                timeCreated = time_change(timeCreated);
                updated = time_change(updated);

                pdflist.push(name.split("/")[1]);
                created_list.push(timeCreated);
                updated_list.push(updated);

            }
        });
        res.render('upload',{ title: '입으로 필기하자', pdflist: pdflist, created_list:created_list, updated_list:updated_list});
    });
});

router.post('/upload', function(req, res, next){
    var fileRef = firebaseAdmin.storage().bucket();
    var pdflist = [];
    var created_list = [];
    var updated_list = [];
    var search_pdf = req.body.search_pdf!=null ? req.body.search_pdf : "";
    console.log(search_pdf);
    fileRef.getFiles({prefix:""}, function(err,files){
        files.forEach(function(file){
            var name = file.name;
            if(name != "test/" && name.includes(search_pdf) && name.includes(".pdf") && name.includes("original/")){
                var timeCreated = file.metadata.timeCreated;
                var updated = file.metadata.updated;

                timeCreated = time_change(timeCreated);
                updated = time_change(updated);

                pdflist.push(name.split("/")[1]);
                created_list.push(timeCreated);
                updated_list.push(updated);

            }
        });
        res.render('upload',{ title: '입으로 필기하자', pdflist: pdflist, created_list:created_list, updated_list:updated_list});
    });
});


router.post('/make_file',upload.single('pdf'),function(req,res, next){
    var pdf_file = req.file;
    var bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer.from(pdf_file.buffer, 'ascii'));

    console.log(pdf_file);
    var fileName = pdf_file.originalname;
    var file = firebaseAdmin.storage().bucket().file("original/"+fileName);
    var memo_file = firebaseAdmin.storage().bucket().file("memo_list/"+fileName.split(".pdf")[0]+".txt");

    bufferStream.pipe(file.createWriteStream({
        metadata:{ contentType: 'application/pdf' }
    })).on('error', (err) => {
        console.log(err); }).on('finish', () => {
        console.log(fileName + " finish");
        res.redirect('upload');
    });

    file = firebaseAdmin.storage().bucket().file("duplicate/"+fileName);

    bufferStream.pipe(file.createWriteStream({
        metadata:{ contentType: 'application/pdf' }
    })).on('error', (err) => {
        console.log(err); }).on('finish', () => {
        console.log(fileName + " finish");
    });

    file = firebaseAdmin.storage().bucket().file("memo_list/"+fileName.split('.pdf')[0]+".txt");

    var bufferStream2 = new stream.PassThrough();
    var base64 = btoa(encodeURIComponent("0list"));
    bufferStream2.end(new Buffer.from(base64, 'ascii'));
    bufferStream2.pipe(file.createWriteStream({
        metadata:{ contentType: 'text/plain' }
    })).on('error', (err) => {
        console.log(err); }).on('finish', () => {
    });

    file = firebaseAdmin.storage().bucket().file("memo_contents/"+fileName.split('.pdf')[0]+"/"+"0.txt");

    var bufferStream3 = new stream.PassThrough();
    bufferStream3.end(new Buffer.from("null", 'ascii'));
    bufferStream3.pipe(file.createWriteStream({
        metadata:{ contentType: 'text/plain' }
    })).on('error', (err) => {
        console.log(err); }).on('finish', () => {
    });

});

router.get('/download', function(req,res,next){
    var pdfName = decodeURIComponent(decodeURI(req.query.pdfName));
    var pageNum = req.query.pageNum == null ? 1 : parseInt(req.query.pageNum);
    var file = firebaseAdmin.storage().bucket().file("duplicate/"+pdfName);
    var memo_file = firebaseAdmin.storage().bucket().file("memo_list/"+pdfName.split(".pdf")[0]+".txt");

    const config = {
        action : "read",
        expires : '12-31-2099'
    };
    memo_file.getSignedUrl(config, (err, url) =>{
        if(err)
            console.log(err);
        fetch(url)
            .then(function(response) {
                response.text().then(function(text) {
                    var decode = decodeURIComponent(atob(text));
                    var title = decode.split("list")[1];
                    var memo_list = title.split("/");
                    for(var i = 0; i < memo_list.length;i++)
                        memo_list[i] = btoa(encodeURIComponent(memo_list[i]));

                    file.getSignedUrl(config, (err, url) =>{
                        if(err)
                            console.log(err);
                        res.render('download', {pdf:url, pdfName:pdfName, memo_list: memo_list, pageNum: pageNum});
                    });
                });
            });
    });
});

router.post('/delete', function(req, res, next){
    var pdfName = req.body.pdfName;
    var file = firebaseAdmin.storage().bucket().file("original/"+pdfName);
    file.delete().then(function(){
        console.log(pdfName + ' delete complete');
    }).catch(function(error){
        console.log(pdfName + ' failed');
    });

    res.redirect('upload');
});

router.post('/memo', function(req, res, next){
    var pdfName = decodeURIComponent(decodeURI(req.body.pdfName));
    var memo = req.body.memo;
    var title = req.body.title;
    var pageNum = parseInt(req.body.pageNum) -1;
    var posX = req.body.posX;
    var posY = req.body.posY;

    var total = "";
    title = decodeURIComponent(atob(title));
    console.log(memo);
    console.log(title);

    var file = firebaseAdmin.storage().bucket().file("memo_list/" + pdfName.split(".pdf")[0] + ".txt");
    const config = {
        action : "read",
        expires : '12-31-2099'
    };
    file.getSignedUrl(config, (err, url) => {
        if (err)
            console.log(err);
        //console.log(url);
        fetch(url)
            .then(function(response) {
                response.text().then(function(text) {
                    total = decodeURIComponent(atob(text));
                    var num = parseInt(total.split("list")[0]);
                    var contents = total.split("list")[1];
                    num++;
                    total = num + "list" + contents + title + "/";
                    total = btoa(encodeURIComponent(total));

                    var original_file = firebaseAdmin.storage().bucket().file("original/" + pdfName);
                    var duplicate_file = firebaseAdmin.storage().bucket().file("duplicate/" + pdfName);

                    var original_url, duplicate_url;
                    original_file.getSignedUrl(config, (err, url) => {
                        if (err)
                            console.log(err);
                        original_url = url;
                        makeMemoOri(original_url, posX, posY, pageNum, num.toString(), pdfName);
                        duplicate_file.getSignedUrl(config, (err, url) => {
                            if (err)
                                console.log(err);
                            duplicate_url = url;
                            makeMemoCop(duplicate_url, posX, posY, pageNum, num.toString(), pdfName);
                        });
                    });

                    var bufferStream = new stream.PassThrough();
                    bufferStream.end(new Buffer.from(total, 'ascii'));
                    bufferStream.pipe(file.createWriteStream({
                        metadata:{ contentType: 'text/plain' }
                    })).on('error', (err) => {
                        console.log(err); }).on('finish', () => {

                        file2 = firebaseAdmin.storage().bucket().file("memo_contents/"+pdfName.split(".pdf")[0]+"/"+num+".txt");
                        var bufferStream2 = new stream.PassThrough();
                        bufferStream2.end(new Buffer.from(memo, 'ascii'));
                        bufferStream2.pipe(file2.createWriteStream({
                            metadata:{ contentType: 'text/plain' }
                        })).on('error', (err) => {
                            console.log(err); }).on('finish', () => {


                            res.redirect('download?pdfName=' + pdfName + "&pageNum=" + (pageNum+1));

                        });
                    });
                });
            });
    });
});

router.post('/select', function(req, res, next){
    var pdfName = req.body.pdfName;
    var num = req.body.num;

    var file = firebaseAdmin.storage().bucket().file("memo_contents/"+pdfName.split(".pdf")[0]+"/"+num+".txt");
    const config = {
        action : "read",
        expires : '12-31-2099'
    };
    file.getSignedUrl(config, (err, url) => {
        if (err)
            console.log(err);
        fetch(url)
            .then(function(response) {
                response.text().then(function(text) {
                    var decode = decodeURIComponent(atob(text));
                    var posX = decode.split("/")[0];
                    var posY = decode.split("/")[1];
                    var memo_page = decode.split("/")[2];
                    var text = decode.split("/")[3];

                    memo_page = parseInt(memo_page) - 1;
                    console.log(decode);


                    var pdf_file = firebaseAdmin.storage().bucket().file("duplicate/" + pdfName);
                    pdf_file.getSignedUrl(config, (err, url) => {
                        if (err)
                            console.log(err);
                        var pdf_url = url;
                        const app = async() =>{
                            await memo(pdf_url, posX, posY, memo_page, text, pdfName);
                            res.redirect('download?pdfName=' + pdfName + "&pageNum=" + (memo_page+1));
                        };
                        app();
                    });
                });
            });
    });
});


router.post('/hide', function(req, res, next){
    var pdfName = req.body.pdfName;
    var pageNum = parseInt(req.body.pageNum)-1;

    var original_file = firebaseAdmin.storage().bucket().file("original/"+pdfName);
    var copy_file = firebaseAdmin.storage().bucket().file("duplicate/" + pdfName);
    var original_url, copy_url;

    const config = {
        action : "read",
        expires : '12-31-2099'
    };
    copy_file.getSignedUrl(config, (err, url) => {
        if (err)
            console.log(err);
        copy_url = url;


        original_file.getSignedUrl(config, (err, url) => {
            if (err)
                console.log(err);
            original_url = url;

            const app3 = async() =>{
                await res.redirect('download?pdfName=' + pdfName + "&pageNum=" + (pageNum+1));
            }
            const app2 = async() =>{
                await copyPage(original_url, copy_url, pageNum, pdfName);
                setTimeout(app3, 1000);
            };
            const app1 = async() =>{
                await deletePage(copy_url, pageNum, pdfName);
                setTimeout(app2,1000);
            };
            app1();
        });

    });

});


router.post('/test', function(req, res, next){
    var file = firebaseAdmin.storage().bucket().file("memo_contents/14주차 강의노트/1.txt");
    const config = {
        action : "read",
        expires : '12-31-2099'
    };
    file.getSignedUrl(config, (err, url) => {
        if (err)
            console.log(err);
        fetch(url)
            .then(function(response) {
                response.text().then(function(text) {
                    var decode = decodeURIComponent(atob(text));
                    var posX = decode.split("/")[0];
                    var posY = decode.split("/")[1];
                    var memo_page = decode.split("/")[2];
                    var text = decode.split("/")[3];

                    console.log(posX + " " + posY);
                    console.log(memo_page);
                    console.log(text);
                    res.redirect('upload');
                });
            });

    });
});


function time_change(original){
    var date = original.split("T");
    var time = date[1].split(":");
    var hour = Number(time[0]) + 9;
    var min = time[1];
    if(hour >=24){
        hour -= 24;
        var new_date = date[0].split("-");
        new_date[2] = Number(new_date[2])+1;
        date[0] = new_date[0] + "-" + new_date[1] + "-" + new_date[2];
    }
    time = hour+"시 " + min + "분";
    var result = date[0] + " " + time;
    return result;
}

module.exports = router;

