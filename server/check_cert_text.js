import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs/promises';

async function checkPdf() {
    const filePath = 'c:/careertrackerSTABLE/server/node_modules/pdf2pic/examples/docker/example.pdf';
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    console.log('--- EXTRACTED TEXT ---');
    console.log(data.text);
    console.log('--- END ---');
}

checkPdf();
