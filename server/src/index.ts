import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from 'hono-rate-limiter'
import { connectDB } from './configs/db'
import type { ApiResponse } from 'shared'
import { accessMiddleware } from './middlewares/access.middleware'
import { authMiddleware } from './middlewares/auth.middleware'
import * as urlController from './controllers/url.controller'
import * as authController from './controllers/auth.controller'

const app = new Hono()

// Connect to Database
connectDB()

app.use(cors())

app.get('/', (c) => {
    return c.json({ message: 'Hi there with HONO' })
})

// Rate limiter untuk auth endpoints (ketat)
const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 menit
    limit: 5, // max 5 request per 15 menit
    standardHeaders: 'draft-6',
    keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
})

// Rate limiter untuk API umum
const apiLimiter = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 menit
    limit: 30, // max 30 request per menit
    standardHeaders: 'draft-6',
    keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
})

// Auth Routes (dengan rate limit ketat)
app.post('/api/auth/register', authLimiter, authController.register)
app.post('/api/auth/login', authLimiter, authController.login)
app.get('/api/auth/me', authMiddleware, authController.getMe)

// URL Shortener API (Protected by Cloudflare Access in production)
if (process.env.CF_ACCESS_AUDIENCE) {
    app.use('/api/*', accessMiddleware)
}

app.post('/api/url/shorten', apiLimiter, urlController.shortenUrl)
app.get('/api/urls', apiLimiter, urlController.getAllUrls)
app.get('/api/urls/:code', apiLimiter, urlController.getUrlDetails)
app.delete('/api/urls/:code', apiLimiter, urlController.deleteUrl)

// Redirect URL
app.get('/:code', urlController.redirectUrl)

// Keep original hello for demo/test
app.get('/hello', async (c) => {
    const data: ApiResponse = {
        message: "Hello BHVR!",
        success: true
    }
    return c.json(data, 200)
})

export default app
