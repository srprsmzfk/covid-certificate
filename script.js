const { PDFDocument, rgb, StandardFonts } = PDFLib
const fontkit = window.fontkit;

const CONFIG = {
    dila: {
        name: {
            x: 357,
            y: 158,
            size: 10,
        },
        age: {
            x: 455,
            y: 175,
            size: 10,
        },
        sex: {
            x: 456,
            y: 191,
            size: 10,
        },
        date: {
            top: {
                x: 441,
                y: 246,
                size: 10,
            },
            bottom: {
                x: 464,
                y: 755,
                size: 8,
            },
        },
    }
}

async function modifyPdf() {
    // Fetch an existing PDF document
    const fields = document.forms[0].elements;
    const config = CONFIG[fields.template.value];

    const url = `/${fields.template.value}.pdf`;
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const fontBytes = await fetch('/calibri.ttf').then((res) => res.arrayBuffer())


    pdfDoc.registerFontkit(fontkit)
    const font = await pdfDoc.embedFont(fontBytes)
    // const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    // const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // Get the first page of the document
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // Get the width and height of the first page
    const { width, height } = firstPage.getSize()

    const { name, date, sex } = document.forms[0].elements;

    console.log( document.forms[0].elements);
    console.log( firstPage.getSize());

    // height: 841.89   792  280   0.34 2.94
    // width: 595.276   612  210

    // Draw a string of text diagonally across the first page
    // firstPage.drawText('Dagestan!', {
    //     x: 5,
    //     y: height / 2 + 300,
    //     size: 50,
    //     font: helveticaFont,
    //     color: rgb(0.95, 0.1, 0.1),
    // })

    Object.keys(config).forEach(key => {
        if (config[key].top) {
            firstPage.drawText(fields[key].value, {
                ...config[key].top,
                y: height - config[key].top.y,
                font: font,
                color: rgb(0, 0, 0),
            });
            firstPage.drawText(fields[key].value, {
                ...config[key].bottom,
                y: height - config[key].bottom.y,
                font: font,
                color: rgb(0, 0, 0),
            });
        } else {
            firstPage.drawText(fields[key].value, {
                ...config[key],
                y: height - config[key].y,
                font: font,
                color: rgb(0, 0, 0),
            });
        }
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save()

    // Trigger the browser to download the PDF document
    download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
}