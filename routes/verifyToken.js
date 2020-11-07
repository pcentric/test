const jwt  = require('jsonwebtoken')

function auth(req, res, next){
        const token = req.header('auth-token')
        if(!token) return res.status(401).send('Wrong Token') 
        try {
            const verified = jwt.verify(token , "secret", )
            req.user = verified
        } catch (error) {
            res.status(400).send('Invalid Token') 
        }
}