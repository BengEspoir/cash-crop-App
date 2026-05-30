const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const { isBuyerRole, mapPayment } = require('../../utils/marketplace');
const {
  BASE_URL,
  CLIENT_URL,
  FAPSHI_BASE_URL,
  FAPSHI_API_USER,
  FAPSHI_API_KEY
} = require('../../config/env');
const ordersService = require('../orders/orders.service');

const isNotFound = (error) => error?.code === 'PGRST116';
const FAPSHI_PROVIDER = 'fapshi';
const TERMINAL_PAYMENT_STATUSES = new Set(['released', 'refunded', 'failed']);
const PROVIDER_FINAL_STATUSES = new Set(['SUCCESSFUL', 'FAILED', 'EXPIRED']);

const getUserProfile = async (table, userId) => {
  const { data, error } = await supabaseAdmin.from(table).select('*').eq('user_id', userId).single();
  if (error && isNotFound(error)) throw new AppError('Profile not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getPaymentsByOrder = async (orderId, payerId) => {
  const query = supabaseAdmin
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1);

  const scoped = payerId ? query.eq('payer_id', payerId) : query;
  const { data, error } = await scoped;
  if (error) throw error;
  return data || [];
};

const getPaymentById = async (paymentId) => {
  const { data, error } = await supabaseAdmin.from('payments').select('*').eq('id', paymentId).single();
  if (error && isNotFound(error)) throw new AppError('Payment not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const getOrderById = async (orderId) => {
  const { data, error } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
  if (error && isNotFound(error)) throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  return data;
};

const buildReturnUrl = (paymentId) => {
  const base = CLIENT_URL || BASE_URL;
  return `${base.replace(/\/$/, '')}/buyer/payments/return?intent=${paymentId}`;
};

const buildWebhookUrl = () => `${String(BASE_URL).replace(/\/$/, '')}/api/v1/payments/webhooks/fapshi`;

const isFapshiConfigured = () => Boolean(FAPSHI_API_USER && FAPSHI_API_KEY && FAPSHI_BASE_URL);

const parseJsonSafely = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Unknown provider response' };
  }
};

const callFapshi = async (path, options = {}) => {
  const baseUrl = String(FAPSHI_BASE_URL || '').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      apiuser: FAPSHI_API_USER,
      apikey: FAPSHI_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new AppError(
      payload?.message || 'Fapshi request failed',
      502,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR || 'EXTERNAL_SERVICE_ERROR'
    );
  }
  return payload;
};

const readProviderStatus = (providerPayload = {}) => String(providerPayload.status || '').toUpperCase();

const mapProviderStatusToPaymentStatus = (providerStatus) => {
  switch (providerStatus) {
    case 'SUCCESSFUL':
      return 'held_in_escrow';
    case 'FAILED':
    case 'EXPIRED':
      return 'failed';
    default:
      return 'pending';
  }
};

const mapProviderStatusToOrderStatus = (providerStatus) => {
  switch (providerStatus) {
    case 'SUCCESSFUL':
      return 'confirmed';
    case 'FAILED':
    case 'EXPIRED':
      return 'pending_payment';
    default:
      return 'pending_payment';
  }
};

const createProviderMetadata = (payment, order, payload = {}) => ({
  ...(payment.metadata || {}),
  provider: FAPSHI_PROVIDER,
  providerReference: payload.transId || payment.transaction_ref || null,
  checkoutUrl: payload.link || payment.metadata?.checkoutUrl || null,
  nextAction: payload.link ? 'redirect_to_checkout' : 'provider_not_configured',
  webhookUrl: buildWebhookUrl(),
  redirectUrl: buildReturnUrl(payment.id),
  externalId: order.order_number || order.id,
  providerStatus: payload.status || payment.metadata?.providerStatus || 'CREATED',
  amount: Number(payment.amount || 0),
  initiatedAt: payload.dateInitiated || payment.metadata?.initiatedAt || new Date().toISOString(),
  latestWebhookAt: payload.latestWebhookAt || payment.metadata?.latestWebhookAt || null,
  lastWebhookPayload: payload.lastWebhookPayload || payment.metadata?.lastWebhookPayload || null,
  lastProviderPayload: payload.lastProviderPayload || payment.metadata?.lastProviderPayload || null,
  verifiedAt: payload.verifiedAt || payment.metadata?.verifiedAt || null,
  mode: 'hosted_checkout'
});

const updateOrderStatusIfNeeded = async (order, nextStatus) => {
  if (!nextStatus || order.status === nextStatus) return order;
  const timeline = Array.isArray(order.timeline) ? [...order.timeline] : [];
  timeline.push({
    event: `Payment provider updated order to ${nextStatus}`,
    status: nextStatus,
    date: new Date().toISOString()
  });
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: nextStatus, timeline })
    .eq('id', order.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const persistProviderResult = async (payment, order, providerPayload, source = 'provider') => {
  const providerStatus = readProviderStatus(providerPayload);
  const nextPaymentStatus = mapProviderStatusToPaymentStatus(providerStatus);
  const nextOrderStatus = mapProviderStatusToOrderStatus(providerStatus);
  const metadata = createProviderMetadata(payment, order, {
    ...providerPayload,
    latestWebhookAt: source === 'webhook' ? new Date().toISOString() : payment.metadata?.latestWebhookAt || null,
    lastWebhookPayload: source === 'webhook' ? providerPayload : payment.metadata?.lastWebhookPayload || null,
    lastProviderPayload: providerPayload,
    verifiedAt: new Date().toISOString()
  });

  const updates = {
    status: nextPaymentStatus,
    channel: payment.channel || 'mtn_momo',
    transaction_ref: providerPayload.transId || payment.transaction_ref || null,
    metadata
  };

  if (providerStatus === 'SUCCESSFUL') {
    updates.paid_at = providerPayload.dateConfirmed || new Date().toISOString();
    updates.escrow_held_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update(updates)
    .eq('id', payment.id)
    .select()
    .single();
  if (error) throw error;

  const updatedOrder = await updateOrderStatusIfNeeded(order, nextOrderStatus);
  return { payment: data, order: updatedOrder };
};

const getFapshiStatus = async (transId) => callFapshi(`/payment-status/${transId}`, { method: 'GET' });

const initiateFapshiCheckout = async (payment, order, user) => {
  const payload = {
    amount: Math.round(Number(payment.amount || 0)),
    userId: user.id,
    externalId: order.order_number || order.id,
    redirectUrl: buildReturnUrl(payment.id),
    webhook: buildWebhookUrl()
  };

  const result = await callFapshi('/initiate-pay', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const metadata = createProviderMetadata(payment, order, {
    ...result,
    lastProviderPayload: result
  });

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      channel: payment.channel || 'mtn_momo',
      transaction_ref: result.transId || payment.transaction_ref || null,
      metadata
    })
    .eq('id', payment.id)
    .select()
    .single();
  if (error) throw error;

  return data;
};

const listPayments = async (user) => {
  let query = supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false });

  if (isBuyerRole(user.role)) {
    query = query.eq('payer_id', user.id);
  } else if ([USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
    query = query.eq('payee_id', user.id);
  } else if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
  }

  const { data, error } = await query;
  if (error) throw error;
  return { items: (data || []).map(mapPayment), count: (data || []).length };
};

const createPayment = async (user, payload) => {
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can create payment records', 403, ERROR_CODES.FORBIDDEN);
  }

  const order = await ordersService.getOrderRowForAccess(user, payload.orderId);
  const sellerTable = order.reseller_id ? 'reseller_profiles' : 'farmer_profiles';
  const sellerId = order.reseller_id || order.farmer_id;
  const farmerProfile = await supabaseAdmin
    .from(sellerTable)
    .select('*')
    .eq('id', sellerId)
    .single();
  if (farmerProfile.error) throw farmerProfile.error;
  await ordersService.ensureFarmerCanReceiveCommerce(farmerProfile.data);

  const farmerUser = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', farmerProfile.data.user_id)
    .single();
  if (farmerUser.error) throw farmerUser.error;

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      order_id: order.id,
      payer_id: user.id,
      payee_id: farmerUser.data.id,
      amount: order.total_amount,
      currency: order.currency || 'XAF',
      status: 'pending',
      channel: payload.channel || null,
      metadata: {
        provider: payload.provider || 'internal_ledger',
        mode: payload.provider === FAPSHI_PROVIDER ? 'hosted_checkout' : 'internal_ledger',
        note: payload.provider === FAPSHI_PROVIDER
          ? 'Hosted Fapshi checkout initiated for this payment.'
          : 'No live payment provider was charged for this record.'
      }
    })
    .select()
    .single();
  if (error) throw error;
  return mapPayment(data);
};

const mapCheckoutIntent = (payment, order = null) => ({
  id: payment.id,
  payment: mapPayment(payment),
  orderId: payment.order_id,
  orderNumber: order?.order_number || null,
  amount: Number(payment.amount || 0),
  amountLabel: mapPayment(payment).amountLabel,
  currency: payment.currency || 'XAF',
  provider: payment.metadata?.provider || 'internal_ledger',
  providerReference: payment.transaction_ref || payment.metadata?.providerReference || null,
  checkoutUrl: payment.metadata?.checkoutUrl || null,
  nextAction: payment.metadata?.nextAction || 'provider_not_configured',
  providerStatus: payment.metadata?.providerStatus || null,
  returnUrl: payment.metadata?.redirectUrl || buildReturnUrl(payment.id),
  status: payment.status || 'pending',
  message: payment.metadata?.provider === FAPSHI_PROVIDER
    ? (payment.metadata?.checkoutUrl
      ? 'Redirect the buyer to complete payment on Fapshi.'
      : 'Fapshi credentials are not configured yet. Add your API User and API Key on the server.')
    : 'Payment provider is not configured yet. An internal ledger payment record was prepared.'
});

const createCheckoutIntent = async (user, payload) => {
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can create checkout intents', 403, ERROR_CODES.FORBIDDEN);
  }

  const order = await ordersService.getOrderRowForAccess(user, payload.orderId);
  const [existing] = await getPaymentsByOrder(order.id, user.id);
  if (existing && !TERMINAL_PAYMENT_STATUSES.has(existing.status)) {
    return mapCheckoutIntent(existing, order);
  }

  const payment = existing
    ? mapPayment(existing)
    : await createPayment(user, {
      orderId: order.id,
      channel: payload.channel || 'mtn_momo',
      provider: payload.provider || FAPSHI_PROVIDER
    });

  let paymentRow = existing || await getPaymentById(payment.id);

  if ((payload.provider || FAPSHI_PROVIDER) === FAPSHI_PROVIDER && isFapshiConfigured()) {
    paymentRow = await initiateFapshiCheckout(paymentRow, order, user);
  } else {
    const fallbackMetadata = createProviderMetadata(paymentRow, order, {
      providerStatus: 'CREATED'
    });
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        channel: payload.channel || paymentRow.channel || 'mtn_momo',
        metadata: {
          ...fallbackMetadata,
          provider: payload.provider || FAPSHI_PROVIDER,
          checkoutUrl: null,
          nextAction: 'provider_not_configured',
          note: 'Fapshi credentials are missing. Add FAPSHI_API_USER and FAPSHI_API_KEY on the backend.'
        }
      })
      .eq('id', paymentRow.id)
      .select()
      .single();
    if (error) throw error;
    paymentRow = data;
  }

  return mapCheckoutIntent(paymentRow, order);
};

const getCheckoutIntent = async (user, intentId) => {
  const payment = await getPaymentById(intentId);
  await ordersService.getOrderRowForAccess(user, payment.order_id);
  const order = await getOrderById(payment.order_id);
  return mapCheckoutIntent(payment, order);
};

const confirmCheckoutIntent = async (user, intentId) => {
  const payment = await getPaymentById(intentId);
  const order = await ordersService.getOrderRowForAccess(user, payment.order_id);
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can confirm checkout intents', 403, ERROR_CODES.FORBIDDEN);
  }

  if (payment.transaction_ref && isFapshiConfigured()) {
    const providerStatus = await getFapshiStatus(payment.transaction_ref);
    const result = await persistProviderResult(payment, order, providerStatus, 'manual_confirm');
    return mapCheckoutIntent(result.payment, result.order);
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      metadata: {
        ...(payment.metadata || {}),
        nextAction: payment.metadata?.checkoutUrl ? 'redirect_to_checkout' : 'provider_not_configured',
        confirmedAt: new Date().toISOString()
      }
    })
    .eq('id', intentId)
    .select()
    .single();
  if (error) throw error;
  return mapCheckoutIntent(data, order);
};

const handleFapshiWebhook = async (payload = {}) => {
  const transId = payload.transId;
  if (!transId) {
    throw new AppError('Webhook transaction id is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('transaction_ref', transId)
    .maybeSingle();
  if (error) throw error;
  if (!payment) {
    return { accepted: true, ignored: true, transId };
  }

  const order = await getOrderById(payment.order_id);
  const providerStatus = isFapshiConfigured() ? await getFapshiStatus(transId) : payload;
  const normalizedStatus = readProviderStatus(providerStatus);

  if (!PROVIDER_FINAL_STATUSES.has(normalizedStatus)) {
    return {
      accepted: true,
      ignored: true,
      transId,
      status: normalizedStatus || 'PENDING'
    };
  }

  const result = await persistProviderResult(payment, order, providerStatus, 'webhook');
  return {
    accepted: true,
    transId,
    status: readProviderStatus(providerStatus),
    paymentId: result.payment.id,
    orderId: result.order.id
  };
};

const releasePayment = async (user, paymentId) => {
  if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Only admins can release internal ledger payments', 403, ERROR_CODES.FORBIDDEN);
  }

  const payment = await getPaymentById(paymentId);
  const order = await getOrderById(payment.order_id);

  const releaseSellerTable = order.reseller_id ? 'reseller_profiles' : 'farmer_profiles';
  const releaseSellerId = order.reseller_id || order.farmer_id;
  const { data: farmerProfile, error: farmerError } = await supabaseAdmin
    .from(releaseSellerTable)
    .select('*')
    .eq('id', releaseSellerId)
    .single();
  if (farmerError) throw farmerError;
  await ordersService.ensureFarmerCanReceiveCommerce(farmerProfile);

  const { data, error: updateError } = await supabaseAdmin
    .from('payments')
    .update({ status: 'released', released_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single();
  if (updateError) throw updateError;
  return mapPayment(data);
};

const requestWithdrawal = async (user) => {
  if (![USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
    throw new AppError('Only sellers can request withdrawals', 403, ERROR_CODES.FORBIDDEN);
  }

  const farmerProfile = await getUserProfile(
    user.role === USER_ROLES.RESELLER ? 'reseller_profiles' : 'farmer_profiles',
    user.id
  );
  await ordersService.ensureFarmerCanReceiveCommerce(farmerProfile);

  return {
    message: 'Withdrawal provider is not integrated yet. Your verified account is eligible once payout processing is configured.'
  };
};

module.exports = {
  listPayments,
  createPayment,
  createCheckoutIntent,
  getCheckoutIntent,
  confirmCheckoutIntent,
  handleFapshiWebhook,
  releasePayment,
  requestWithdrawal
};
