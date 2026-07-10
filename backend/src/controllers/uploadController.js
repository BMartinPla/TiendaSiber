const supabase = require('../config/supabase')

const BUCKET = 'product-images'

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' })
    }

    const ext = req.file.originalname.split('.').pop()
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return res.status(500).json({ error: 'Error al subir archivo a Storage' })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

    res.json({ url: urlData.publicUrl, filename: fileName })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Error al subir archivo' })
  }
}

module.exports = { uploadFile }
