const express = require('express')
const cors = require('cors')
const compression = require('compression')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const userRoutes = require('./routes/userRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const orderRoutes = require('./routes/orderRoutes')

const app = express()

app.use(cors())
app.use(compression())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/orders', orderRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err)
  const message = err.message || 'Error interno del servidor'
  res.status(err.status || 500).json({ error: message })
})

module.exports = app
