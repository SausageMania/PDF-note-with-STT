var fs = require('fs');
var fetch = require("node-fetch");
var fontkit = require("@pdf-lib/fontkit");
var pdfLib = require("pdf-lib");

var modify = async function() {
    var hangeul = "한글 되는 거냐?"
    const existingPdfBytes = fs.readFileSync("test.pdf");

    const pdfDoc = await pdfLib.PDFDocument.load(existingPdfBytes)
    pdfDoc.registerFontkit(fontkit)

    const customFont = await pdfDoc.embedFont(fs.readFileSync('BM-HANNA.ttf'))

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    firstPage.drawText(hangeul, {
        x: 5,
        y: height / 2 + 300,
        size: 50,
        font: customFont,
        color: pdfLib.rgb(0.95, 0.1, 0.1),
        rotate: pdfLib.degrees(-45),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('./test.pdf',pdfBytes);
}

module.exports = modify;