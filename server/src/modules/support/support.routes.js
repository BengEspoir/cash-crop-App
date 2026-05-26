const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  listTickets,
  createTicket,
  getTicket,
  addMessage,
  updateTicket
} = require('./support.controller');
const {
  createTicketSchema,
  addMessageSchema,
  updateTicketSchema
} = require('./support.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/tickets', listTickets);
router.post('/tickets', validate(createTicketSchema), createTicket);
router.get('/tickets/:id', getTicket);
router.patch('/tickets/:id', validate(updateTicketSchema), updateTicket);
router.post('/tickets/:id/messages', validate(addMessageSchema), addMessage);

module.exports = router;
