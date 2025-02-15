const getTokenFromHeader = require("../auth/getTokenFromHeader");
const { verifyAccessToken } = require("../auth/verifyToken");

const authenticate = (requireAuth = true) => (req, res, next) => {
    if (!requireAuth) {
        return next();
    }

    const token = getTokenFromHeader(req.headers);

    if (!token) {
        return res.status(401).json({ message: "No autorizado" });
    }
    try {
        const decoded = verifyAccessToken(token);
        req.user = { ...decoded.user };
        next();
    } catch (error) {

        return res.status(401).json({ message: "No autorizado" });
    }
};

module.exports = authenticate;
