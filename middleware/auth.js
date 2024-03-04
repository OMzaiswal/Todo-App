const jwt = require('jsonwebtoken');

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                res.status(403)
            } else {
                req.userId = user.id;
                next();
            }
        })
    } else {
        res.status(401);
    }
}

module.exports = {
    authenticateJwt
}