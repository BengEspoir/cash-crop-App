const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const repository = require('./support.repository');
const notificationsRepository = require('../notifications/notifications.repository');
const { logAdminAudit } = require('../../utils/adminAudit');

const isAdmin = (user) => [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role);

const helpLinkForRole = (role) => {
  if ([USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(role)) return '/farmer/help-support';
  if ([USER_ROLES.LOCAL_BUYER, USER_ROLES.INTERNATIONAL_BUYER].includes(role)) return '/buyer/help-support';
  if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) return '/admin/help-support';
  return '/help';
};

const generateTicketNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TCK-${stamp}-${suffix}`;
};

const ensureTicketAccess = async (user, ticketId) => {
  const ticket = await repository.getTicketRow(ticketId);
  if (!ticket || (!isAdmin(user) && ticket.user_id !== user.id)) {
    throw new AppError('Support ticket not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return ticket;
};

const listTickets = async (user) => {
  const items = await repository.listTickets({
    userId: user.id,
    includeAll: isAdmin(user)
  });
  return { items, count: items.length };
};

const createTicket = async (user, payload, req) => {
  const ticket = await repository.createTicket({
    ticket_number: generateTicketNumber(),
    user_id: user.id,
    subject: payload.subject,
    description: payload.description,
    category: payload.category || 'general',
    priority: payload.priority || 'normal',
    related_entity_type: payload.relatedEntityType || null,
    related_entity_id: payload.relatedEntityId || null,
    metadata: payload.metadata || {}
  });

  await repository.addMessage({
    ticket_id: ticket.id,
    sender_id: user.id,
    sender_role: user.role,
    body: payload.description,
    internal_note: false,
    metadata: { createdWithTicket: true }
  });

  await notificationsRepository.create({
    userId: user.id,
    type: 'system',
    title: `Support ticket ${ticket.ticketNumber} created`,
    content: 'Your support request has been recorded and will appear in your ticket history.',
    link: helpLinkForRole(user.role),
    entityType: 'support_ticket',
    entityId: ticket.id,
    priority: ticket.priority === 'urgent' ? 'urgent' : 'normal'
  });

  await logAdminAudit(user, req, 'SUPPORT_TICKET_CREATED', {
    resourceType: 'support_ticket',
    resourceId: ticket.id,
    ticketNumber: ticket.ticketNumber
  });

  return repository.getTicket(ticket.id);
};

const getTicket = async (user, ticketId) => {
  await ensureTicketAccess(user, ticketId);
  const ticket = await repository.getTicket(ticketId);
  const messages = await repository.listMessages(ticketId, isAdmin(user));
  return { ...ticket, messages };
};

const addMessage = async (user, ticketId, payload, req) => {
  const ticket = await ensureTicketAccess(user, ticketId);
  const internalNote = isAdmin(user) ? Boolean(payload.internalNote) : false;
  const message = await repository.addMessage({
    ticket_id: ticket.id,
    sender_id: user.id,
    sender_role: user.role,
    body: payload.body,
    internal_note: internalNote,
    metadata: {}
  });

  const updatePayload = {
    last_message_at: new Date().toISOString()
  };

  if (isAdmin(user) && ticket.status === 'open') {
    updatePayload.status = 'in_progress';
  } else if (!isAdmin(user) && ticket.status === 'waiting_on_user') {
    updatePayload.status = 'in_progress';
  }

  await repository.updateTicket(ticket.id, updatePayload);

  if (!internalNote) {
    const targetUserId = isAdmin(user) ? ticket.user_id : ticket.assigned_admin_id;
    if (targetUserId) {
      const targetLink = isAdmin(user)
        ? helpLinkForRole((await repository.getTicket(ticket.id))?.creator?.role)
        : '/admin/help-support';
      await notificationsRepository.create({
        userId: targetUserId,
        type: 'system',
        title: `New support reply on ${ticket.ticket_number}`,
        content: payload.body,
        link: targetLink,
        entityType: 'support_ticket',
        entityId: ticket.id,
        priority: ticket.priority
      });
    }
  }

  await logAdminAudit(user, req, 'SUPPORT_TICKET_MESSAGE_ADDED', {
    resourceType: 'support_ticket',
    resourceId: ticket.id,
    internalNote
  });

  return message;
};

const updateTicket = async (user, ticketId, payload, req) => {
  if (!isAdmin(user)) {
    throw new AppError('Only admins can update support ticket status', 403, ERROR_CODES.FORBIDDEN);
  }

  await ensureTicketAccess(user, ticketId);
  const now = new Date().toISOString();
  const updatePayload = {};
  if (payload.status) {
    updatePayload.status = payload.status;
    if (payload.status === 'resolved') updatePayload.resolved_at = now;
    if (payload.status === 'closed') updatePayload.closed_at = now;
  }
  if (payload.priority) updatePayload.priority = payload.priority;
  if (Object.prototype.hasOwnProperty.call(payload, 'assignedAdminId')) {
    updatePayload.assigned_admin_id = payload.assignedAdminId || null;
  }

  const ticket = await repository.updateTicket(ticketId, updatePayload);
  await logAdminAudit(user, req, 'SUPPORT_TICKET_UPDATED', {
    resourceType: 'support_ticket',
    resourceId: ticket.id,
    status: ticket.status,
    priority: ticket.priority
  });
  return ticket;
};

module.exports = {
  listTickets,
  createTicket,
  getTicket,
  addMessage,
  updateTicket
};
