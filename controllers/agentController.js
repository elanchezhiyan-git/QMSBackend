const AgentSession = require("../models/agentSessionModel");

exports.selectCounter = async (req, res) => {
    const {counter_id} = req.body;

    if (!counter_id) return res
        .status(400)
        .json({success: false, message: "counter_id required"});

    await AgentSession.deactivateAll(req.user.id);
    await AgentSession.chooseCounter(req.user.id, counter_id);

    return res.json({
        success: true, message: "Counter selected",
    });
};

exports.activeCounter = async (req, res) => {
    const counterId = await AgentSession.getActiveCounter(req.user.id);

    return res.json({
        success: true, result: {counter_id: counterId},
    });
};
