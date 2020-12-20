var path = require('path');
var fs = require('fs');
var os = require('os');
var fontkit = require("@pdf-lib/fontkit");
var pdfLib = require("pdf-lib");
var fetch = require("node-fetch");

const admin = require('firebase-admin');
var serviceAccount = require('../Firebase_key.json');
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "editor-ou9m.appspot.com"
}, "storage2");


var makeMemoOri = async function(oriUrl,x,y,pageNum,memoNum, pdfName){
  var posX = x;
  var posY = y;
  const existingPdfBytes = await fetch(oriUrl).then(res => res.buffer());
  const pdfDoc = await pdfLib.PDFDocument.load(existingPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const customFont = await pdfDoc.embedFont(fs.readFileSync('BM-HANNA.ttf'));
  const jpgImage = await pdfDoc.embedJpg(fs.readFileSync('memoG.jpg'));

  const pages = pdfDoc.getPages();
  const targetPage = pages[pageNum];
  const { width, height } = targetPage.getSize();

  const textSize = 30;
  const textWidth = customFont.widthOfTextAtSize(memoNum,textSize);
  const textHeight = customFont.heightAtSize(textSize);

  posX = x * width;
  posY = y * height;

  targetPage.drawImage(jpgImage,{
    x: posX-5,
    y: height - posY - 5 ,
    width:textWidth + 10,
    height:textHeight + 5,
  });

  targetPage.drawText(memoNum, {
    x: posX,
    y: height - posY,
    size: textSize,
    font: customFont,
    color: pdfLib.rgb(0, 0, 0),
    rotate: pdfLib.degrees(0),
  });

  const newPdfFile = await pdfDoc.save();
  const tempFilePath = path.join(os.tmpdir(), pdfName);
  fs.writeFileSync(tempFilePath, newPdfFile);
  var bucket = firebaseAdmin.storage().bucket();
  var options = {
    destination: "original/"+pdfName
  }
  bucket.upload(tempFilePath,options,function(err,file){
  });

}

module.exports = makeMemoOri;