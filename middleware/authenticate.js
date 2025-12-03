const {verifyAccessToken} = require('../utils/token');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({
                success: false, message: 'Not authenticated',
            });
        }

        const payload = verifyAccessToken(token);
        req.user = payload;

        next();
    } catch (err) {
        return res.status(401).json({
            success: false, message: 'Invalid or expired access token',
        });
    }
};
