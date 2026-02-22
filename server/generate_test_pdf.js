import fs from 'fs';
import path from 'path';

// This is a minimal valid PDF 1.4 binary source for a single page with text
const minimalPdfBase64 =
    'JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNSAwIFI+PmVuZG9iag00IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5lbmRvYmo1IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0NClJUClsvRjEgMTEgV29yaGRdIFRKIChIZWxsbyBXb3JsZCEpIFRqDQplbmRzdHJlYW0NZW5kb2JqDQp4cmVmDQowIDYNCjAwMDAwMDAwMDAgNjU1MzUgZiANClxyDQowMDAwMDAwMDA5IDAwMDAwIG4gDQpcaDQowMDAwMDAwMDU2IDAwMDAwIG4gDQpcaDQowMDAwMDAwMTExIDAwMDAwIG4gDQpcaDQowMDAwMDAwMjEyIDAwMDAwIG4gDQpcaDQowMDAwMDAwMjYyIDAwMDAwIG4gDQpcaA10cmFpbGVyPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PnN0YXJ0eHJlZg0KMzU3DQolJUVPRg==';

const filePath = path.join(process.cwd(), 'uploads/certificates/test_valid.pdf');

// Ensure directory exists
if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

fs.writeFileSync(filePath, Buffer.from(minimalPdfBase64, 'base64'));
console.log('✅ Valid minimal PDF created at:', filePath);
