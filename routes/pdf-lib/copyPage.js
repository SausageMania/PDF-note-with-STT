var path = require('path');
var fs = require('fs');
var os = require('os');
var pdfLib = require("pdf-lib");
var fetch = require("node-fetch");

const admin = require('firebase-admin');
var serviceAccount = require('../Firebase_key.json');
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "editor-ou9m.appspot.com"
}, "storage6");

var copyPage = async function(oriUrl, copUrl, pageNum, pdfName){
  const existingPdfBytes2 = await fetch(oriUrl).then(res => res.buffer());
  const pdfDoc2 = await pdfLib.PDFDocument.load(existingPdfBytes2);

  const existingPdfBytes1 = await fetch(copUrl).then(res => res.buffer());
  const pdfDoc1 = await pdfLib.PDFDocument.load(existingPdfBytes1);

  const [copiedPage] = await pdfDoc1.copyPages(pdfDoc2,[pageNum]);

  pdfDoc1.insertPage(pageNum, copiedPage);

  const pdfBytes = await pdfDoc1.save();
  const tempFilePath = path.join(os.tmpdir(), pdfName);
  fs.writeFileSync(tempFilePath, pdfBytes);
  var bucket = firebaseAdmin.storage().bucket();
  var options = {
    destination: "duplicate/"+pdfName
  }
  bucket.upload(tempFilePath,options,function(err,file){
  });
  console.log("success2");
}

module.exports = copyPage;