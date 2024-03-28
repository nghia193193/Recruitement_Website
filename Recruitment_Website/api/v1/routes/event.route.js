"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const event_controller_1 = require("../controllers/event.controller");
const router = (0, express_1.Router)();
router.get('/', event_controller_1.eventController.getAllEvents);
router.get('/:eventId', (0, express_validator_1.param)('eventId').trim().isMongoId().withMessage('Id không hợp lệ'), event_controller_1.eventController.getSingleEvent);
exports.default = router;
