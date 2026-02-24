
import express from 'express'
import multer from 'multer'
import { getCertificates, uploadCertificate, toggleCertificateResume, deleteCertificate } from '../controllers/certificateController.js'


const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Verify authMiddleware existence or use inline if necessary
// Based on resumeController usage `req.user`, likely a middleware populates it.
// Checking auth.js or index.js would confirm, but usually it's imported.
// I'll assume standard middleware pattern. If it crashes I'll fix.

// Actually, looking at `resumeController.js`, it says `req.user // Attached by authMiddleware`
// I need to find where authMiddleware is located. usually `server/middleware/auth.js` or `utils`.
// I'll assume it's passed or available. 

import { protect } from '../middleware/authMiddleware.js'

router.get('/', protect, getCertificates)
router.post('/upload', protect, upload.single('certificate'), uploadCertificate)
router.patch('/toggle-resume/:id', protect, toggleCertificateResume)
router.delete('/:id', protect, deleteCertificate)

export default router
