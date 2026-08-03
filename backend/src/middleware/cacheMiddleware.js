const cache = new Map()
const DEFAULT_TTL = 5 * 60 * 1000

function cacheMiddleware({ ttl = DEFAULT_TTL } = {}) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next()

    res.set('Cache-Control', 'no-store')
    res.set('Vary', 'Authorization')

    const key = cacheKeyFor(req)
    const entry = cache.get(key)
    if (entry && Date.now() - entry.ts < ttl) {
      return res.json(entry.data)
    }

    res.locals.cacheKey = key
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      if (res.locals.cacheKey && res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(res.locals.cacheKey, { ts: Date.now(), data: body })
      }
      return originalJson(body)
    }
    next()
  }
}

function cacheKeyFor(req) {
  const role = req.user?.role || 'GUEST'
  return `${req.method} ${req.originalUrl}|${role}`
}

function invalidateCache(prefix) {
  for (const key of [...cache.keys()]) {
    if (key.includes(prefix)) cache.delete(key)
  }
}

function invalidateProductsAndCategories() {
  invalidateCache('/products')
  invalidateCache('/categories')
}

module.exports = { cacheMiddleware, invalidateCache, invalidateProductsAndCategories }
