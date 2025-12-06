const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.create = async (req, res) => {
    const {name, email, phone, password, role} = req.body;

    if (!name) return res
        .status(400)
        .json({success: false, message: "Name is required"});

    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const id = await User.create({
        name, email, phone, password: hashed, role,
    });

    const newUser = await User.findById(id);

    return res.json({
        success: true, result: newUser, message: "User created",
    });
};

exports.list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.items) || 10;
    const offset = (page - 1) * limit;

    const users = await User.list(limit, offset);
    const total = await User.totalCount();

    return res.json({
        success: true, result: users, pagination: {
            page, pages: Math.ceil(total / limit), count: total,
        },
    });
};

exports.update = async (req, res) => {
    const updated = await User.update(req.params.id, req.body);

    return res.json({
        success: true, result: updated, message: "User updated",
    });
};

exports.delete = async (req, res) => {
    await User.softDelete(req.params.id);

    return res.json({
        success: true, message: "User removed",
    });
};
