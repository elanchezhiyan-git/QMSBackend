const Counter = require("../models/counterModel");

exports.create = async (req, res) => {
    const {name} = req.body;

    if (!name) return res
        .status(400)
        .json({success: false, message: "Counter name required"});

    const id = await Counter.create(name);
    const counter = await Counter.read(id);

    return res.json({
        success: true, result: counter, message: "Counter created",
    });
};

exports.list = async (req, res) => {
    const counters = await Counter.list();

    return res.json({
        success: true, result: counters,
    });
};

exports.listActive = async (req, res) => {
    const counters = await Counter.listActive();

    return res.json({
        success: true, result: counters,
    });
};

exports.update = async (req, res) => {
    const updated = await Counter.update(req.params.id, req.body.name);

    return res.json({
        success: true, result: updated, message: "Counter updated",
    });
};

exports.updateActiveStatus = async (req, res) => {
    const updated = await Counter.updateActiveStatus(req.params.id, req.body.enabled);

    return res.json({
        success: true, result: updated, message: "Counter updated",
    });
};

exports.delete = async (req, res) => {
    await Counter.delete(req.params.id);

    return res.json({
        success: true, message: "Counter removed",
    });
};
