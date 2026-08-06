function validateId(req, res, next) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  next()
}

module.exports = validateId
