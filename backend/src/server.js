const app = require('./app')

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Tienda Siber API corriendo en http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
