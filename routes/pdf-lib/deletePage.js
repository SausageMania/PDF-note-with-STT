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
}, "storage5");


var deletePage = async function(url, pageNum, pdfName) {
  const existingPdfBytes = await fetch(url).then(res => res.buffer());
  const pdfDoc = await pdfLib.PDFDocument.load(existingPdfBytes);

  pdfDoc.removePage(pageNum);

  const pdfBytes = await pdfDoc.save();
  const tempFilePath = path.join(os.tmpdir(), pdfName);
  fs.writeFileSync(tempFilePath, pdfBytes);
  var bucket = firebaseAdmin.storage().bucket();
  var options = {
    destination: "duplicate/"+pdfName
  }
  bucket.upload(tempFilePath,options,function(err,file){
  });
  console.log("success1");

}

module.exports = deletePage;