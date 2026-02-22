import pdf from 'pdf-parse/lib/pdf-parse.js'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import fs from 'fs/promises'
import path from 'path'

/**
 * Extracts text from a PDF file.
 * Primary: pdf-parse
 * Fallback: pdfjs-dist (Pure JS)
 * @param {string} filePath - Absolute path to the PDF file.
 * @returns {Promise<{text: string, method: string}>}
 */
export async function extractTextFromPdf(filePath) {
    console.log(`[Extractor] Processing: ${path.basename(filePath)}`)

    // Attempt 1: pdf-parse (Primary)
    try {
        const dataBuffer = await fs.readFile(filePath)
        const data = await pdf(dataBuffer)
        const text = data.text.trim()

        // If it worked and we got something, use it
        if (text.length > 0) {
            console.log('[Extractor] Primary (pdf-parse) SUCCESS')
            return { text, method: 'pdf-parse' }
        }
        console.log('[Extractor] Primary (pdf-parse) returned no text.')
    } catch (error) {
        console.warn(`[Extractor] Primary (pdf-parse) FAILED: ${error.message}`)
    }

    // Attempt 2: pdfjs-dist (Fallback)
    try {
        console.log('[Extractor] Attempting Fallback (pdfjs-dist)...')
        const text = await extractWithPdfJs(filePath)

        if (text && text.trim().length > 0) {
            console.log('[Extractor] Fallback (pdfjs-dist) SUCCESS')
            return { text: text.trim(), method: 'pdfjs-dist' }
        }
    } catch (fallbackError) {
        console.error(`[Extractor] Fallback (pdfjs-dist) FAILED: ${fallbackError.message}`)
    }

    throw new Error('All extraction methods failed. The document might be image-only without an embedded text layer.')
}

/**
 * Robust extraction using pdfjs-dist (legacy build for Node compatibility)
 */
async function extractWithPdfJs(filePath) {
    const data = new Uint8Array(await fs.readFile(filePath))
    const loadingTask = pdfjsLib.getDocument({
        data,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
    })

    const pdfDocument = await loadingTask.promise
    console.log(`[Extractor] Fallback: PDF loaded, pages: ${pdfDocument.numPages}`)
    let fullText = ''

    // Iterate through pages (usually just 1 for certificates, but let's be safe)
    const numPages = Math.min(pdfDocument.numPages, 3) // Only first 3 pages

    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i)
        const textContent = await page.getTextContent()
        console.log(`[Extractor] Fallback: Page ${i} text items: ${textContent.items.length}`)
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + '\n'
    }

    return fullText
}
