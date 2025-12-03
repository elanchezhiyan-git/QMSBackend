const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");
const {
    generateRefreshToken, generateAccessToken, verifyRefreshToken
} = require("../utils/token");

exports.login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) return res
        .status(400)
        .json({success: false, message: "Missing login fields"});

    const user = await User.findByEmail(email);

    if (!user) return res
        .status(401)
        .json({success: false, message: "Invalid credentials"});

    const passwordMatch = await bcrypt.compare(password, user.password || "");

    if (!passwordMatch) return res
        .status(401)
        .json({success: false, message: "Invalid credentials"});

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.save(user.id, refreshToken);

    res.cookie("access_token", accessToken, {
        httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true, sameSite: "strict", path: "/api/private/auth", maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
        success: true, result: {id: user.id, name: user.name, role: user.role}, message: "Login successful",
    });
};

exports.refresh = async (req, res) => {
    try {
        const token = req.cookies.refresh_token;

        if (!token) return res
            .status(401)
            .json({success: false, message: "No refresh token"});

        const payload = verifyRefreshToken(token);

        const isValid = await RefreshToken.validate(payload.id, token);

        if (!isValid) return res.status(401).json({
            success: false, message: "Invalid refresh token",
        });

        const newAccess = generateAccessToken({
            id: payload.id, role: payload.role, name: payload.name,
        });

        res.cookie("access_token", newAccess, {
            httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000,
        });

        return res.json({
            success: true, message: "Token refreshed",
        });
    } catch (err) {
        return res.status(401).json({
            success: false, message: "Refresh failed",
        });
    }
};

exports.logout = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        await RefreshToken.delete(refreshToken);
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token", {
        path: "/api/private/auth"
    });

    return res.json({success: true, message: "Logged out"});
};

exports.me = async (req, res) => {
    const user = await User.findById(req.user.id);

    return res.json({
        success: true, result: user,
    });
};
