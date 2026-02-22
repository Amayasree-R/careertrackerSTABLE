import express from 'express'
import multer from 'multer'
import {
    uploadCertificate,
    toggleCertificateResume,
    deleteCertificate,
    getCertificates
} from '../controllers/certificateController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Multer Configuration: 10MB limit and PDF files only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(new Error('Only PDF files are allowed'), false)
        }
    }
})

// GET /api/certificates/
router.get('/', protect, getCertificates)

// POST /api/certificates/upload
router.post('/upload', protect, upload.single('certificate'), uploadCertificate)

// PATCH /api/certificates/:certificateId/toggle-resume
router.patch('/:certificateId/toggle-resume', protect, toggleCertificateResume)

// DELETE /api/certificates/:certificateId
router.delete('/:certificateId', protect, deleteCertificate)

export default router
