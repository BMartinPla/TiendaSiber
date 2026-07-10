const multer = require('multer')
const path = require('path')

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|jfif|png|gif|webp|svg)$/i
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp, svg)'), false)
  }
}

const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

module.exports = upload
