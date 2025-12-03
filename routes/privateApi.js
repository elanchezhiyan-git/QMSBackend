const express = require("express");
const {catchErrors} = require("../handlers/errorHandlers");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const counterController = require("../controllers/counterController");
const ticketController = require("../controllers/ticketController");
const agentController = require("../controllers/agentController");

const router = express.Router();

router.post("/auth/login", catchErrors(authController.login));

router.post("/auth/refresh", catchErrors(authController.refresh));

router.post("/auth/logout", authenticate, catchErrors(authController.logout));

router.get("/auth/me", authenticate, catchErrors(authController.me));

router.get("/users", authenticate, authorize("admin", "manager"), catchErrors(userController.list));

router.post("/users", authenticate, authorize("admin", "manager"), catchErrors(userController.create));

router.patch("/users/:id", authenticate, authorize("admin", "manager"), catchErrors(userController.update));

router.delete("/users/:id", authenticate, authorize("admin", "manager"), catchErrors(userController.delete));

router.get("/counters", authenticate, authorize("admin", "manager", "agent"), catchErrors(counterController.list));

router.post("/counters", authenticate, authorize("admin", "manager"), catchErrors(counterController.create));

router.patch("/counters/:id", authenticate, authorize("admin", "manager"), catchErrors(counterController.update));

router.patch("/counters/updateStatus/:id", authenticate, authorize("admin", "manager"), catchErrors(counterController.updateActiveStatus));

router.delete("/counters/:id", authenticate, authorize("admin", "manager"), catchErrors(counterController.delete));

router.get("/tickets", authenticate, authorize("admin", "manager", "agent","customer"), catchErrors(ticketController.list));

router.get("/tickets/metrics", authenticate, authorize("admin", "manager", "agent"), catchErrors(ticketController.list));

router.delete("/tickets/:id", authenticate, authorize("admin", "manager"), catchErrors(ticketController.delete));

router.post("/agent/select-counter", authenticate, authorize("agent"), catchErrors(agentController.selectCounter));

router.get("/agent/active-counter", authenticate, authorize("agent"), catchErrors(agentController.activeCounter));

router.get("/agent/current-ticket", authenticate, authorize("admin", "manager", "agent"), catchErrors(ticketController.agentCurrentTicket));

router.post("/agent/call-next/:counterId", authenticate, authorize("agent"), catchErrors(ticketController.callNext));

router.post("/agent/finish/:ticketId", authenticate, authorize("agent"), catchErrors(ticketController.finish));

module.exports = router;
