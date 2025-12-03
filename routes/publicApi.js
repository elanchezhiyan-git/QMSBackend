const express = require("express");
const { catchErrors } = require("../handlers/errorHandlers");

const ticketController = require("../controllers/ticketController");
const counterController = require("../controllers/counterController");

const router = express.Router();

router.post("/ticket/create", catchErrors(ticketController.create));

router.get("/ticket/status/:id", catchErrors(ticketController.status));

router.get("/ticket/my", catchErrors(ticketController.myTickets));

router.get("/counters", catchErrors(counterController.listActive))

module.exports = router;
