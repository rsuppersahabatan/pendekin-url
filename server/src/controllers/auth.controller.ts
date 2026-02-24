import type { Context } from 'hono'
import { sign } from 'hono/jwt'
import { UserModel } from '../models/user.model'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret_key'
const JWT_EXPIRES_IN = 60 * 60 * 24 * 7 // 7 hari dalam detik

const generateToken = async (userId: string, role: string): Promise<string> => {
    const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRES_IN
    return sign({ id: userId, role, exp }, JWT_SECRET)
}

// POST /api/auth/register
export const register = async (c: Context) => {
    try {
        const { name, email, password } = await c.req.json()

        // Validasi input
        if (!name || !email || !password) {
            return c.json({ error: 'Name, email, and password are required' }, 400)
        }

        if (password.length < 6) {
            return c.json({ error: 'Password must be at least 6 characters' }, 400)
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return c.json({ error: 'Email already registered' }, 400)
        }

        // Buat user baru (password akan di-hash oleh pre-save hook)
        const user = new UserModel({ name, email, password, role: 'user' })
        await user.save()

        const token = await generateToken(user._id.toString(), user.role)

        return c.json(
            {
                message: 'Registration successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            201
        )
    } catch (error) {
        console.error('Register error:', error)
        return c.json({ error: 'Registration failed' }, 500)
    }
}

// POST /api/auth/login
export const login = async (c: Context) => {
    try {
        const { email, password } = await c.req.json()

        // Validasi input
        if (!email || !password) {
            return c.json({ error: 'Email and password are required' }, 400)
        }

        // Cari user berdasarkan email
        const user = await UserModel.findOne({ email: email.toLowerCase() })
        if (!user) {
            return c.json({ error: 'Invalid email or password' }, 401)
        }

        // Bandingkan password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return c.json({ error: 'Invalid email or password' }, 401)
        }

        const token = await generateToken(user._id.toString(), user.role)

        return c.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        return c.json({ error: 'Login failed' }, 500)
    }
}

// GET /api/auth/me (protected)
export const getMe = async (c: Context) => {
    try {
        const payload = c.get('user') as { id: string; role: string }
        const user = await UserModel.findById(payload.id).select('-password')

        if (!user) {
            return c.json({ error: 'User not found' }, 404)
        }

        return c.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        })
    } catch (error) {
        console.error('GetMe error:', error)
        return c.json({ error: 'Failed to fetch user data' }, 500)
    }
}
