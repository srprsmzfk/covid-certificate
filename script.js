const { PDFDocument, rgb } = PDFLib
const fontkit = window.fontkit;

document.querySelector('.btn').addEventListener('click', () => modifyPdf());
document.querySelector('.ios').style.display = /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'block' : 'none';

async function modifyPdf() {
    const fields = document.forms[0].elements;

    const url = `./${fields.template.value}.pdf`;
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const fontBytes = await fetch('./calibri.ttf').then((res) => res.arrayBuffer());
    const boldFontBytes = await fetch('./calibri_bold.ttf').then((res) => res.arrayBuffer());

    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);

    const DILA_CONFIG = {
        name: {
            x: 357,
            y: 158,
            size: 10,
            font: boldFont,
        },
        age: {
            x: 456,
            y: 176,
            size: 10,
        },
        sex: {
            x: 456,
            y: 192,
            size: 10,
        },
        date: {
            top: {
                x: 456,
                y: 239,
                size: 10,
            },
            bottom: {
                x: 464,
                y: 755,
                size: 8,
            },
        },
    };

    const CONFIG = {
        dila: DILA_CONFIG,
        dila_qr: DILA_CONFIG,
    };

    const config = CONFIG[fields.template.value];

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const { height } = firstPage.getSize()

    Object.keys(config).forEach(key => {
        if (config[key].top) {
            firstPage.drawText(fields[key].value, {
                font: font,
                color: rgb(0, 0, 0),
                ...config[key].top,
                y: height - config[key].top.y,
            });
            firstPage.drawText(fields[key].value.split(' ')[0], {
                font: font,
                color: rgb(0, 0, 0),
                ...config[key].bottom,
                y: height - config[key].bottom.y,
            });
        } else {
            firstPage.drawText(fields[key].value, {
                font: font,
                color: rgb(0, 0, 0),
                ...config[key],
                y: height - config[key].y,
            });
        }
    });

    firstPage.drawText(Date.now().toString().slice(0, 10), {
        font: font,
        color: rgb(0, 0, 0),
        x: 456,
        y: height - 223,
        size: 10,
    });

    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, `covid-certificate-${fields.date.value.split(' ')[0]}.pdf`, 'application/pdf');
}
