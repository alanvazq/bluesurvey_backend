const getTokenFromHeader = require("../auth/getTokenFromHeader");
const {verifyAccessToken} = require("../auth/verifyToken");

const authenticate = (requireAuth = true) => (req, res, next) => {

    if(!requireAuth) {
        next();
        return;
    }

    const token = getTokenFromHeader(req.headers);

    if (token) {
        const decoded = verifyAccessToken(token);
        if (decoded) {
            req.user = { ...decoded };
            next();
        } else {
            res.status(401).json({
                message: 'No autorizado'
            })
        }
    } else {
        res.status(401).json({
            message: 'No autorizado'
        })
    }
}


module.exports = authenticate;
