import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const auth = async (req, res, next) => {
    // console.log('auth middleware')
    // next()
    try {
        // const token = req.header('Authorization').replace('Bearer ', '')
        console.log("Headers:", req.headers);

        if (!req.header('Authorization')) {
            return res.status(401).send({ error: 'No token provided' });
        }

        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).send({ error: 'Invalid token format' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        // console.log(token)

        if (!user) {
            throw new Error
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

export default auth