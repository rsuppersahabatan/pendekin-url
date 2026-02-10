import type { Context } from 'hono'
import { URLModel } from '../models/url.model'
import { generateShortId } from '../utils'
import validUrl from 'valid-url'

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

export const shortenUrl = async (c: Context) => {
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
}

export const redirectUrl = async (c: Context) => {
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
}

export const getAllUrls = async (c: Context) => {
    try {
        const urls = await URLModel.find().sort({ date: -1 })
        return c.json(urls)
    } catch (error) {
        console.error('Error fetching URLs:', error)
        return c.json({ error: 'Failed to fetch URLs' }, 500)
    }
}

export const getUrlDetails = async (c: Context) => {
    try {
        const code = c.req.param('code')
        const url = await URLModel.findOne({ urlCode: code })

        if (url) {
            return c.json(url)
        } else {
            return c.json({ error: 'URL not found' }, 404)
        }
    } catch (error) {
        console.error('Error fetching URL details:', error)
        return c.json({ error: 'Server Error' }, 500)
    }
}

export const deleteUrl = async (c: Context) => {
    try {
        const code = c.req.param('code')
        const result = await URLModel.findOneAndDelete({ urlCode: code })

        if (result) {
            return c.json({ message: 'URL deleted successfully' })
        } else {
            return c.json({ error: 'URL not found' }, 404)
        }
    } catch (error) {
        console.error('Error deleting URL:', error)
        return c.json({ error: 'Server Error' }, 500)
    }
}
