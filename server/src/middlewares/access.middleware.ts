import type { Context, Next } from 'hono'
import { decode, verify } from 'hono/jwt'

export const accessMiddleware = async (c: Context, next: Next) => {
    const aud = c.env.CF_ACCESS_AUDIENCE;
    const certsUrl = c.env.CF_ACCESS_CERTS_URL;
    const token = c.req.header('Cf-Access-Jwt-Assertion');

    if (!token) {
        return c.json({ message: 'Unauthorized: No JWT provided', success: false }, 401);
    }

    try {
        // 1. Decode token to get kid
        const { header } = decode(token);
        const kid = header.kid;

        if (!kid) {
            return c.json({ message: 'Unauthorized: Invalid token header', success: false }, 401);
        }

        // 2. Fetch JWKs from Cloudflare
        const response = await fetch(certsUrl);
        const jwks = await response.json() as { keys: any[] };
        const key = jwks.keys.find((k: any) => k.kid === kid);

        if (!key) {
            return c.json({ message: 'Unauthorized: Public key not found', success: false }, 401);
        }

        // 3. Verify JWT
        // Note: Hono's verify expects a string secret or CryptoKey. 
        // For RS256, we need to import the JWK as a CryptoKey.
        const cryptoKey = await crypto.subtle.importKey(
            'jwk',
            key,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256',
            },
            false,
            ['verify']
        );

        await verify(token, cryptoKey, 'RS256');
        
        // 4. Verify Audience
        const { payload } = decode(token);
        if (payload.aud !== aud) {
            return c.json({ message: 'Unauthorized: Audience mismatch', success: false }, 401);
        }

        // 5. Verify Expiration (Hono's verify handles this, but let's be explicit if needed)
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return c.json({ message: 'Unauthorized: Token expired', success: false }, 401);
        }

        await next();
    } catch (error) {
        console.error('JWT Validation Error:', error);
        return c.json({ message: 'Unauthorized: Invalid token', success: false }, 401);
    }
}
