const { Router } = require('express')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const upload = require('../config/upload')
const { uploadFile } = require('../controllers/uploadController')

const router = Router()

router.post('/', authenticate, authorize('ADMIN'), upload.single('image'), uploadFile)

module.exports = router
