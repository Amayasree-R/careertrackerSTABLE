import path from 'path';
import { extractTextFromPdf } from './services/certificateExtractorService.js';

async function test() {
    console.log('--- Testing Refactored Extraction Service ---');
    const testPdfPath = path.join(process.cwd(), 'uploads/certificates/test_valid.pdf');

    try {
        const result = await extractTextFromPdf(testPdfPath);
        console.log('\n✅ Extraction Result:');
        console.log('Method:', result.method);
        console.log('Text Content:', result.text);

        if (result.text.includes('Hello World')) {
            console.log('\n🎉 SUCCESS: Text extracted correctly!');
        } else {
            console.warn('\n⚠️ Extraction worked but text was unexpected.');
        }
    } catch (err) {
        console.error('\n❌ Extraction FAILED:');
        console.error(err);
    }
}

test();
