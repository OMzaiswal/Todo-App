const jwt = require('jsonwebtoken');
const SECRET = 's3cR3t';

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, user) => {
            if (err) {
                res.status(403)
            } else {
                res.userId = user.id;
                next();
            }
        })
    } else {
        res.status(401);
    }
}

module.exports = {
    authenticateJwt,
    SECRET
}