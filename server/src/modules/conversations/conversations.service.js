const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const {
  FARMER_VERIFICATION_STATUS,
  isBuyerRole,
  mapFarmerProfile,
  mapResellerProfile,
  mapMessage,
  mapUserName,
  normalizeVerificationStatus
} = require('../../utils/marketplace');

const isNotFound = (error) => error?.code === 'PGRST116';

const getUsersByIds = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, status, region, city, country, created_at')
    .in('id', uniqueIds);
  if (error) throw error;
  return (data || []).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
};

const getFarmerProfileById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('farmer_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error && isNotFound(error)) throw new AppError('Farmer not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getResellerProfileById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('reseller_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error && isNotFound(error)) throw new AppError('Reseller not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getBuyerProfileById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('buyer_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error && isNotFound(error)) throw new AppError('Buyer not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getQuoteParticipants = async (quoteId) => {
  const { data: quote, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .eq('id', quoteId)
    .single();
  if (error && isNotFound(error)) throw new AppError('Quote not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;

  const farmer = quote.farmer_id ? await getFarmerProfileById(quote.farmer_id) : null;
  const reseller = quote.reseller_id ? await getResellerProfileById(quote.reseller_id) : null;
  const buyer = await getBuyerProfileById(quote.buyer_id);
  return { quote, farmer, reseller, buyer };
};

const orderedParticipants = (a, b) => String(a) < String(b) ? [a, b] : [b, a];

const findExistingConversation = async (participant1, participant2, listingId) => {
  let query = supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('participant_1', participant1)
    .eq('participant_2', participant2);

  query = listingId ? query.eq('listing_id', listingId) : query.is('listing_id', null);

  const { data, error } = await query.maybeSingle();
  if (error && !isNotFound(error)) throw error;
  return data;
};

const createConversation = async (user, payload) => {
  let otherUserId;
  let listingId = payload.listingId || null;
  let warning = null;

  if (payload.quoteId) {
    const { quote, farmer, reseller, buyer } = await getQuoteParticipants(payload.quoteId);
    const seller = reseller || farmer;
    listingId = quote.listing_id || listingId;
    if (user.id === seller.user_id) otherUserId = buyer.user_id;
    if (user.id === buyer.user_id) otherUserId = seller.user_id;
    if (!otherUserId) throw new AppError('Quote not connected to your account', 403, ERROR_CODES.FORBIDDEN);
  } else if (payload.farmerId) {
    if (!isBuyerRole(user.role)) {
      throw new AppError('Only buyers can start a farmer conversation from public profiles', 403, ERROR_CODES.FORBIDDEN);
    }
    const farmerProfile = await getFarmerProfileById(payload.farmerId);
    otherUserId = farmerProfile.user_id;
    if (normalizeVerificationStatus(farmerProfile) !== FARMER_VERIFICATION_STATUS.VERIFIED) {
      warning = 'This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.';
    }
  } else if (payload.resellerId) {
    if (!isBuyerRole(user.role)) {
      throw new AppError('Only buyers can start a reseller conversation from public profiles', 403, ERROR_CODES.FORBIDDEN);
    }
    const resellerProfile = await getResellerProfileById(payload.resellerId);
    otherUserId = resellerProfile.user_id;
    if (normalizeVerificationStatus(resellerProfile) !== FARMER_VERIFICATION_STATUS.VERIFIED) {
      warning = 'This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.';
    }
  } else if (payload.buyerId) {
    if (![USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
      throw new AppError('Only sellers can start buyer conversations directly', 403, ERROR_CODES.FORBIDDEN);
    }
    const buyerProfile = await getBuyerProfileById(payload.buyerId);
    otherUserId = buyerProfile.user_id;
  }

  if (!otherUserId || otherUserId === user.id) {
    throw new AppError('Conversation participant is invalid', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const [participant1, participant2] = orderedParticipants(user.id, otherUserId);
  let conversation = await findExistingConversation(participant1, participant2, listingId);
  if (!conversation) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        listing_id: listingId,
        participant_1: participant1,
        participant_2: participant2,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    conversation = data;
  }

  if (payload.initialMessage) {
    await sendMessage(user, conversation.id, payload.initialMessage);
  }

  return {
    conversation: await getConversation(user, conversation.id),
    farmerWarning: warning
  };
};

const listConversations = async (user) => {
  const { data: rows, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) throw error;

  const conversationIds = (rows || []).map((row) => row.id);
  const users = await getUsersByIds((rows || []).flatMap((row) => [row.participant_1, row.participant_2]));
  const latestByConversation = {};
  if (conversationIds.length) {
    const { data: messages, error: messageError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });
    if (messageError) throw messageError;
    for (const message of messages || []) {
      if (!latestByConversation[message.conversation_id]) latestByConversation[message.conversation_id] = message;
    }
  }

  return {
    items: (rows || []).map((row) => {
      const otherId = row.participant_1 === user.id ? row.participant_2 : row.participant_1;
      const other = users[otherId] || {};
      const latest = latestByConversation[row.id];
      return {
        id: row.id,
        participant: mapUserName(other),
        participantId: otherId,
        role: other.role || 'user',
        preview: latest?.content || 'No messages yet.',
        unread: 0,
        listingId: row.listing_id,
        lastMessageAt: row.last_message_at || row.created_at
      };
    })
  };
};

const assertConversationAccess = (row, userId) => {
  if (!row || (row.participant_1 !== userId && row.participant_2 !== userId)) {
    throw new AppError('Conversation not found for this account', 404, ERROR_CODES.NOT_FOUND);
  }
};

const getConversation = async (user, conversationId) => {
  const { data: row, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  if (error && isNotFound(error)) throw new AppError('Conversation not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  assertConversationAccess(row, user.id);

  const { data: messages, error: messageError } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (messageError) throw messageError;

  const users = await getUsersByIds([
    row.participant_1,
    row.participant_2,
    ...(messages || []).map((message) => message.sender_id)
  ]);
  const otherId = row.participant_1 === user.id ? row.participant_2 : row.participant_1;
  const other = users[otherId] || {};

  let farmer = null;
  if (other.role === USER_ROLES.FARMER) {
    const { data: farmerProfile } = await supabaseAdmin
      .from('farmer_profiles')
      .select('*')
      .eq('user_id', otherId)
      .maybeSingle();
    if (farmerProfile) farmer = mapFarmerProfile(farmerProfile, other);
  } else if (other.role === USER_ROLES.RESELLER) {
    const { data: resellerProfile } = await supabaseAdmin
      .from('reseller_profiles')
      .select('*')
      .eq('user_id', otherId)
      .maybeSingle();
    if (resellerProfile) farmer = mapResellerProfile(resellerProfile, other);
  }

  return {
    id: row.id,
    participant: mapUserName(other),
    participantId: otherId,
    role: other.role || 'user',
    listingId: row.listing_id,
    farmer,
    warning: farmer?.verificationStatus !== FARMER_VERIFICATION_STATUS.VERIFIED && farmer
      ? 'This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.'
      : null,
    messages: (messages || []).map((message) => mapMessage(message, users[message.sender_id], user.id))
  };
};

const sendMessage = async (user, conversationId, content) => {
  const { data: conversation, error: conversationError } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  if (conversationError && isNotFound(conversationError)) throw new AppError('Conversation not found', 404, ERROR_CODES.NOT_FOUND);
  if (conversationError) throw conversationError;
  assertConversationAccess(conversation, user.id);

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })
    .select()
    .single();
  if (error) throw error;

  await supabaseAdmin
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  const users = await getUsersByIds([user.id]);
  return mapMessage(data, users[user.id], user.id);
};

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  sendMessage
};
