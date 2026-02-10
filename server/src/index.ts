import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { connectDB } from './configs/db'
import type { ApiResponse } from 'shared'
import * as urlController from './controllers/url.controller'

const app = new Hono()

// Connect to Database
connectDB()

app.use(cors())

app.get('/', (c) => {
    return c.json({ message: 'Hi there with HONO' })
})

// URL Shortener API
app.post('/api/url/shorten', urlController.shortenUrl)
app.get('/api/urls', urlController.getAllUrls)
app.get('/api/urls/:code', urlController.getUrlDetails)
app.delete('/api/urls/:code', urlController.deleteUrl)

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
