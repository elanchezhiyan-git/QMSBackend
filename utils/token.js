const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,       // change to true in production (HTTPS)
        maxAge: 10 * 60 * 1000
    });

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch {
        return null;
    }
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
        return null;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
