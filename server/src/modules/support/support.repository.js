const { supabaseAdmin } = require('../../config/supabase');

const isNotFound = (error) => error?.code === 'PGRST116';

const mapUserName = (user) => {
  if (!user) return 'Unknown user';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || user.phone || 'Unknown user';
};

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role')
    .in('id', uniqueIds);
  if (error) throw error;

  return (data || []).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
};

const mapTicket = (row, users = {}, messageCount = 0) => {
  const creator = users[row.user_id];
  const admin = users[row.assigned_admin_id];
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    relatedEntityType: row.related_entity_type,
    relatedEntityId: row.related_entity_id,
    metadata: row.metadata || {},
    creator: creator ? {
      id: creator.id,
      name: mapUserName(creator),
      role: creator.role,
      email: creator.email
    } : null,
    assignedAdmin: admin ? {
      id: admin.id,
      name: mapUserName(admin),
      role: admin.role,
      email: admin.email
    } : null,
    messageCount,
    lastMessageAt: row.last_message_at,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const mapMessage = (row, users = {}) => {
  const sender = users[row.sender_id];
  return {
    id: row.id,
    ticketId: row.ticket_id,
    body: row.body,
    internalNote: row.internal_note,
    senderRole: row.sender_role,
    sender: sender ? {
      id: sender.id,
      name: mapUserName(sender),
      role: sender.role,
      email: sender.email
    } : null,
    metadata: row.metadata || {},
    createdAt: row.created_at
  };
};

const hydrateTickets = async (rows) => {
  if (!rows.length) return [];

  const users = await getUsersByIds(rows.flatMap((row) => [row.user_id, row.assigned_admin_id]));
  const { data: counts, error } = await supabaseAdmin
    .from('support_ticket_messages')
    .select('ticket_id')
    .in('ticket_id', rows.map((row) => row.id));
  if (error) throw error;

  const countByTicket = (counts || []).reduce((acc, item) => {
    acc[item.ticket_id] = (acc[item.ticket_id] || 0) + 1;
    return acc;
  }, {});

  return rows.map((row) => mapTicket(row, users, countByTicket[row.id] || 0));
};

const listTickets = async ({ userId, includeAll = false }) => {
  let query = supabaseAdmin
    .from('support_tickets')
    .select('*')
    .order('last_message_at', { ascending: false });

  if (!includeAll) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return hydrateTickets(data || []);
};

const createTicket = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  const [ticket] = await hydrateTickets([data]);
  return ticket;
};

const getTicketRow = async (ticketId) => {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();
  if (error && isNotFound(error)) return null;
  if (error) throw error;
  return data;
};

const getTicket = async (ticketId) => {
  const row = await getTicketRow(ticketId);
  if (!row) return null;
  const [ticket] = await hydrateTickets([row]);
  return ticket;
};

const updateTicket = async (ticketId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .update(payload)
    .eq('id', ticketId)
    .select()
    .single();
  if (error) throw error;
  const [ticket] = await hydrateTickets([data]);
  return ticket;
};

const listMessages = async (ticketId, includeInternal = false) => {
  let query = supabaseAdmin
    .from('support_ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (!includeInternal) {
    query = query.eq('internal_note', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  const users = await getUsersByIds((data || []).map((row) => row.sender_id));
  return (data || []).map((row) => mapMessage(row, users));
};

const addMessage = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from('support_ticket_messages')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;

  const users = await getUsersByIds([data.sender_id]);
  return mapMessage(data, users);
};

module.exports = {
  listTickets,
  createTicket,
  getTicketRow,
  getTicket,
  updateTicket,
  listMessages,
  addMessage
};
