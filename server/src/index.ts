import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { connectDB } from './configs/db'
import { URLModel } from './models/url.model'
import { generateShortId } from './utils'
import validUrl from 'valid-url'
import type { ApiResponse } from 'shared'

const app = new Hono()

// Connect to Database
connectDB()

app.use(cors())

const baseUrl = process.env.BASEURI

const generateUniqueShortId = async () => {
    let shortId;
    let existingURL;

    while (true) {
        shortId = generateShortId();
        existingURL = await URLModel.findOne({ urlCode: shortId });

        if (!existingURL) {
            break;
        }
    }
    return shortId;
};

app.get('/', (c) => {
    return c.json({ message: 'Hi there' })
})

app.post('/api/url/shorten', async (c) => {
    const { longUrl, urlCode } = await c.req.json()

    try {
        if (!validUrl.isUri(longUrl)) {
            return c.json({ error: "Invalid Url" }, 401)
        }

        if (urlCode) {
            const existingCodeBookmark = await URLModel.findOne({ urlCode })
            if (existingCodeBookmark) {
                return c.json({ error: `Code ${urlCode} already in use. Please choose a different code.` }, 400)
            }
        }

        const existingURL = await URLModel.findOne({ longUrl })
        if (existingURL && !urlCode) {
            return c.json({ urlCode: existingURL.urlCode })
        }

        let generatedCode
        if (!urlCode) {
            generatedCode = await generateUniqueShortId()
        } else {
            generatedCode = urlCode
        }
        const shortUrl = `${baseUrl}/${generatedCode}`

        const newURL = new URLModel({
            urlCode: generatedCode,
            longUrl,
            shortUrl,
        })
        await newURL.save()
        return c.json({ urlCode: generatedCode }, 201)
    } catch (error) {
        console.error('Error shortening URL:', error)
        return c.json({ error: 'Failed to shorten URL' }, 500)
    }
})

app.get('/:code', async (c) => {
    try {
        const code = c.req.param('code')
        const url = await URLModel.findOne({ urlCode: code })
        
        if (url) {
            return c.redirect(url.longUrl)
        } else {
            return c.json('No URL Found', 404)
        }
    } catch (err) {
        console.error(err)
        return c.json('Server Error', 500)
    }
})

// Keep original hello for demo/test
app.get('/hello', async (c) => {
    const data: ApiResponse = {
        message: "Hello BHVR!",
        success: true
    }
    return c.json(data, 200)
})

export default app
