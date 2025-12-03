const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

exports.create = async (req, res) => {
    const {name, phone, counter_id} = req.body;

    if (!name || !phone || !counter_id) return res.status(400).json({
        success: false, message: "Missing required fields",
    });

    let customer = await User.findByPhone(phone);

    if (!customer) {
        const userId = await User.create({
            name, phone, role: "customer",
        });
        customer = await User.findById(userId);
    }

    const ticketId = await Ticket.create(customer.id, counter_id);
    const ticket = await Ticket.read(ticketId);

    return res.json({
        success: true, result: ticket, message: "Ticket created",
    });
};

exports.status = async (req, res) => {
    const ticket = await Ticket.read(req.params.id);

    if (!ticket) return res
        .status(404)
        .json({success: false, message: "Ticket not found"});

    return res.json({success: true, result: ticket});
};

exports.myTickets = async (req, res) => {

    const phone = req.query.phone;

    if (!phone) return res
        .status(400)
        .json({success: false, message: "Phone number required"});

    const tickets = await Ticket.listByPhone(phone);

    return res.json({success: true, result: tickets});
};

exports.agentCurrentTicket = async (req, res) => {
    const agentId = req.user.id;

    if (!agentId) return res
        .status(400)
        .json({success: false, message: "Agent ID is required"});

    const ticket = await Ticket.readByAgent(agentId);
    return res.json({success: true, result: ticket});
}

exports.list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.items) || 20;
    const offset = (page - 1) * limit;

    const tickets = await Ticket.list(limit, offset);
    const total = await Ticket.totalCount();

    return res.json({
        success: true, result: tickets, pagination: {
            page, pages: Math.ceil(total / limit), count: total,
        },
    });
};

exports.callNext = async (req, res) => {
    const counterId = req.params.counterId;
    const agentId = req.user.id;

    const ticket = await Ticket.callNext(counterId, agentId);

    if (!ticket) return res
        .status(404)
        .json({success: false, message: "No pending tickets"});

    return res.json({
        success: true, result: ticket, message: "Ticket called",
    });
};

exports.finish = async (req, res) => {
    const ok = await Ticket.finish(req.params.ticketId, req.user.id);

    if (!ok) return res
        .status(404)
        .json({success: false, message: "Ticket not found"});

    return res.json({
        success: true, message: "Ticket finished",
    });
};

exports.delete = async (req, res) => {
    await Ticket.softDelete(req.params.id);

    return res.json({
        success: true, message: "Ticket removed",
    });
};
