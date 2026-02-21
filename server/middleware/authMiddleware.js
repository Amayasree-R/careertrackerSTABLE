
import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = { _id: decoded.userId } // Match how controller expects it
            req.userId = decoded.userId // Match how profile.js uses it
            next()
        } catch (error) {
            console.error('Not authorized, token failed')
            res.status(401).json({ error: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' })
    }
}

export default protect
