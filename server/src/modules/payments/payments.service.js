const crypto = require('crypto');
const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const { isBuyerRole, mapPayment } = require('../../utils/marketplace');
const {
  BASE_URL,
  CLIENT_URL,
  FAPSHI_BASE_URL,
  FAPSHI_API_USER,
  FAPSHI_API_KEY,
  FAPSHI_WEBHOOK_SECRET,
  FAPSHI_REQUEST_TIMEOUT_MS
} = require('../../config/env');
const ordersService = require('../orders/orders.service');

const FAPSHI_PROVIDER = 'fapshi';
const FINAL_PROVIDER_STATUSES = new Set(['SUCCESSFUL', 'FAILED', 'EXPIRED']);
const isNotFound = (error) => error?.code === 'PGRST116';

const requireFapshiConfiguration = () => {
  if (!FAPSHI_API_USER || !FAPSHI_API_KEY || !FAPSHI_BASE_URL) {
    throw new AppError('Fapshi is not configured', 503, 'EXTERNAL_SERVICE_ERROR');
  }
};

const requireWebhookSecret = () => {
  if (!FAPSHI_WEBHOOK_SECRET) {
    throw new AppError('Fapshi webhook validation is not configured', 503, 'EXTERNAL_SERVICE_ERROR');
  }
};

const signatureForPayment = (paymentId) => crypto
  .createHmac('sha256', FAPSHI_WEBHOOK_SECRET)
  .update(paymentId)
  .digest('base64url');

const createSignedExternalId = (paymentId) => {
  requireWebhookSecret();
  return `${paymentId}.${signatureForPayment(paymentId)}`;
};

const verifySignedExternalId = (externalId) => {
  requireWebhookSecret();
  const [paymentId, signature, extra] = String(externalId || '').split('.');
  if (!paymentId || !signature || extra) {
    throw new AppError('Invalid Fapshi webhook signature', 401, ERROR_CODES.UNAUTHORIZED);
  }
  const expected = Buffer.from(signatureForPayment(paymentId));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new AppError('Invalid Fapshi webhook signature', 401, ERROR_CODES.UNAUTHORIZED);
  }
  return paymentId;
};

const parseJsonSafely = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Unknown provider response' };
  }
};

const callFapshi = async (path, options = {}) => {
  requireFapshiConfiguration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FAPSHI_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${String(FAPSHI_BASE_URL).replace(/\/$/, '')}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        apiuser: FAPSHI_API_USER,
        apikey: FAPSHI_API_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      throw new AppError(payload?.message || 'Fapshi request failed', 502, 'EXTERNAL_SERVICE_ERROR');
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error.name === 'AbortError' ? 'Fapshi request timed out' : `Fapshi connection failed: ${error.message}`;
    throw new AppError(message, 502, 'EXTERNAL_SERVICE_ERROR');
  } finally {
    clearTimeout(timeout);
  }
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

const getPayeeId = async (order) => {
  const table = order.reseller_id ? 'reseller_profiles' : 'farmer_profiles';
  const profileId = order.reseller_id || order.farmer_id;
  const { data, error } = await supabaseAdmin.from(table).select('user_id').eq('id', profileId).single();
  if (error) throw error;
  return data.user_id;
};

const buildReturnUrl = (paymentId) => `${String(CLIENT_URL || BASE_URL).replace(/\/$/, '')}/buyer/payments/return?intent=${paymentId}`;
const buildWebhookUrl = () => `${String(BASE_URL).replace(/\/$/, '')}/api/webhooks/fapshi`;

const providerMetadata = (payment, order, providerPayload = {}) => ({
  ...(payment.metadata || {}),
  provider: FAPSHI_PROVIDER,
  mode: 'hosted_checkout',
  providerInitiationState: providerPayload.transId ? 'initiated' : payment.metadata?.providerInitiationState,
  providerReference: providerPayload.transId || payment.transaction_ref || null,
  checkoutUrl: providerPayload.link || payment.metadata?.checkoutUrl || null,
  nextAction: providerPayload.link ? 'redirect_to_checkout' : payment.metadata?.nextAction || 'await_payment',
  webhookUrl: buildWebhookUrl(),
  redirectUrl: buildReturnUrl(payment.id),
  externalId: createSignedExternalId(payment.id),
  providerStatus: providerPayload.status || payment.metadata?.providerStatus || 'CREATED',
  providerAmount: providerPayload.amount ?? Number(payment.amount),
  providerCurrency: providerPayload.currency || payment.currency,
  lastProviderPayload: providerPayload,
  orderNumber: order.order_number || null,
  verifiedAt: providerPayload.verifiedAt || null
});

const getFapshiStatus = (transId) => callFapshi(`/payment-status/${encodeURIComponent(transId)}`, { method: 'GET' });

const assertProviderProof = (payment, providerPayload) => {
  if (String(providerPayload.transId || '') !== String(payment.transaction_ref || '')) {
    throw new AppError('Fapshi transaction reference mismatch', 409, ERROR_CODES.VALIDATION_ERROR);
  }
  const signedPaymentId = verifySignedExternalId(providerPayload.externalId);
  if (signedPaymentId !== payment.id) {
    throw new AppError('Fapshi payment identity mismatch', 409, ERROR_CODES.VALIDATION_ERROR);
  }
  if (providerPayload.userId && String(providerPayload.userId) !== String(payment.payer_id)) {
    throw new AppError('Fapshi payer identity mismatch', 409, ERROR_CODES.VALIDATION_ERROR);
  }
  if (!Number.isFinite(Number(providerPayload.amount)) || Math.round(Number(providerPayload.amount)) !== Math.round(Number(payment.amount))) {
    throw new AppError('Fapshi amount mismatch', 409, ERROR_CODES.VALIDATION_ERROR);
  }
};

const reconcileProviderPayment = async (payment, order, providerPayload) => {
  assertProviderProof(payment, providerPayload);
  const status = String(providerPayload.status || '').toUpperCase();
  if (!FINAL_PROVIDER_STATUSES.has(status)) {
    return { payment, order, settled: false };
  }
  const metadata = providerMetadata(payment, order, {
    ...providerPayload,
    verifiedAt: new Date().toISOString()
  });
  const { data, error } = await supabaseAdmin.rpc('reconcile_fapshi_payment', {
    p_payment_id: payment.id,
    p_transaction_ref: payment.transaction_ref,
    p_provider_status: status,
    p_provider_amount: Math.round(Number(providerPayload.amount)),
    p_provider_currency: providerPayload.currency || payment.currency,
    p_confirmed_at: providerPayload.dateConfirmed || null,
    p_provider_metadata: metadata
  });
  if (error) throw error;
  return data;
};

const mapCheckoutIntent = (payment, order = null) => ({
  id: payment.id,
  payment: mapPayment(payment),
  orderId: payment.order_id,
  orderNumber: order?.order_number || null,
  amount: Number(payment.amount || 0),
  amountLabel: mapPayment(payment).amountLabel,
  baseAmount: Number(order?.base_amount || payment.metadata?.amountBreakdown?.baseAmount || payment.amount || 0),
  logisticsFee: Number(order?.logistics_fee || payment.metadata?.amountBreakdown?.logisticsFee || 0),
  platformCommission: Number(order?.platform_commission || payment.metadata?.amountBreakdown?.platformCommission || 0),
  sellerNetAmount: Number(order?.seller_net_amount || payment.metadata?.amountBreakdown?.sellerNetAmount || 0),
  currency: payment.currency || 'XAF',
  provider: payment.metadata?.provider || FAPSHI_PROVIDER,
  providerReference: payment.transaction_ref || null,
  checkoutUrl: payment.metadata?.checkoutUrl || null,
  nextAction: payment.metadata?.nextAction || 'await_payment',
  providerStatus: payment.metadata?.providerStatus || null,
  returnUrl: payment.metadata?.redirectUrl || buildReturnUrl(payment.id),
  status: payment.status || 'pending',
  message: payment.metadata?.checkoutUrl
    ? 'Redirect the buyer to complete payment on Fapshi.'
    : 'The payment is being prepared with Fapshi.'
});

const createAtomicPayment = async (user, payload) => {
  const order = await ordersService.getOrderRowForAccess(user, payload.orderId);
  const payeeId = await getPayeeId(order);
  const metadata = {
    provider: payload.provider || FAPSHI_PROVIDER,
    mode: (payload.provider || FAPSHI_PROVIDER) === FAPSHI_PROVIDER ? 'hosted_checkout' : 'internal_ledger',
    amountBreakdown: {
      baseAmount: Number(order.base_amount || 0),
      logisticsFee: Number(order.logistics_fee || 0),
      platformCommission: Number(order.platform_commission || 0),
      sellerNetAmount: Number(order.seller_net_amount || 0)
    }
  };
  const { data, error } = await supabaseAdmin.rpc('get_or_create_payment_intent', {
    p_order_id: order.id,
    p_payer_id: user.id,
    p_payee_id: payeeId,
    p_amount: order.total_amount,
    p_currency: order.currency || 'XAF',
    p_channel: payload.channel || 'mtn_momo',
    p_metadata: metadata
  });
  if (error) throw error;
  return data;
};

const listPayments = async (user) => {
  let query = supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false });
  if (isBuyerRole(user.role)) query = query.eq('payer_id', user.id);
  else if ([USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) query = query.eq('payee_id', user.id);
  else if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
  }
  const { data, error } = await query;
  if (error) throw error;
  return { items: (data || []).map(mapPayment), count: (data || []).length };
};

const createPayment = async (user, payload) => {
  if (!isBuyerRole(user.role)) throw new AppError('Only buyers can create payment records', 403, ERROR_CODES.FORBIDDEN);
  const result = await createAtomicPayment(user, payload);
  return mapPayment(result.payment);
};

const initiateFapshiCheckout = async (payment, order, user) => {
  const { data: claim, error: claimError } = await supabaseAdmin.rpc('claim_payment_provider_initiation', {
    p_payment_id: payment.id,
    p_provider: FAPSHI_PROVIDER,
    p_claimed_at: new Date().toISOString()
  });
  if (claimError) throw claimError;
  if (!claim.claimed) return claim.payment;

  const externalId = createSignedExternalId(payment.id);
  const providerResult = await callFapshi('/initiate-pay', {
    method: 'POST',
    body: JSON.stringify({
      amount: Math.round(Number(payment.amount)),
      userId: user.id,
      externalId,
      redirectUrl: buildReturnUrl(payment.id),
      webhook: buildWebhookUrl(),
      message: `AgriculNet order ${order.order_number || order.id}`
    })
  });
  if (!providerResult.transId || !providerResult.link) {
    throw new AppError('Fapshi returned an incomplete checkout response', 502, 'EXTERNAL_SERVICE_ERROR');
  }
  const metadata = providerMetadata(claim.payment, claim.order, providerResult);
  const { data, error } = await supabaseAdmin.rpc('save_payment_provider_checkout', {
    p_payment_id: payment.id,
    p_transaction_ref: providerResult.transId,
    p_checkout_url: providerResult.link,
    p_channel: payment.channel || 'mtn_momo',
    p_provider_metadata: metadata
  });
  if (error) throw error;
  return data.payment;
};

const createCheckoutIntent = async (user, payload) => {
  if (!isBuyerRole(user.role)) throw new AppError('Only buyers can create checkout intents', 403, ERROR_CODES.FORBIDDEN);
  if ((payload.provider || FAPSHI_PROVIDER) !== FAPSHI_PROVIDER) {
    throw new AppError('Only Fapshi checkout is supported', 400, ERROR_CODES.VALIDATION_ERROR);
  }
  requireFapshiConfiguration();
  requireWebhookSecret();
  const result = await createAtomicPayment(user, { ...payload, provider: FAPSHI_PROVIDER });
  let payment = result.payment;
  if (!payment.metadata?.checkoutUrl) payment = await initiateFapshiCheckout(payment, result.order, user);
  return mapCheckoutIntent(payment, result.order);
};

const getCheckoutIntent = async (user, intentId) => {
  const payment = await getPaymentById(intentId);
  const order = await ordersService.getOrderRowForAccess(user, payment.order_id);
  return mapCheckoutIntent(payment, order);
};

const confirmCheckoutIntent = async (user, intentId) => {
  const payment = await getPaymentById(intentId);
  const order = await ordersService.getOrderRowForAccess(user, payment.order_id);
  if (!isBuyerRole(user.role)) throw new AppError('Only buyers can confirm checkout intents', 403, ERROR_CODES.FORBIDDEN);
  if (!payment.transaction_ref) return mapCheckoutIntent(payment, order);
  const provider = await getFapshiStatus(payment.transaction_ref);
  const result = await reconcileProviderPayment(payment, order, provider);
  return mapCheckoutIntent(result.payment, result.order);
};

const handleFapshiWebhook = async (payload = {}) => {
  const transId = String(payload.transId || '');
  if (!transId) throw new AppError('Webhook transaction id is required', 400, ERROR_CODES.VALIDATION_ERROR);
  const paymentId = verifySignedExternalId(payload.externalId);
  const payment = await getPaymentById(paymentId);
  if (payment.transaction_ref !== transId) {
    throw new AppError('Fapshi webhook transaction mismatch', 401, ERROR_CODES.UNAUTHORIZED);
  }
  const order = await getOrderById(payment.order_id);
  const provider = await getFapshiStatus(transId);
  const result = await reconcileProviderPayment(payment, order, provider);
  return {
    accepted: true,
    ignored: !FINAL_PROVIDER_STATUSES.has(String(provider.status || '').toUpperCase()),
    transId,
    status: String(provider.status || '').toUpperCase(),
    paymentId: result.payment.id,
    orderId: result.order.id
  };
};

const releasePayment = async (user, paymentId) => {
  if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Only admins can release escrow payments', 403, ERROR_CODES.FORBIDDEN);
  }
  const { data, error } = await supabaseAdmin.rpc('release_marketplace_escrow', {
    p_payment_id: paymentId,
    p_actor_user_id: user.id,
    p_released_at: new Date().toISOString()
  });
  if (error) throw error;
  return mapPayment(data.payment);
};

const requestWithdrawal = async (user) => {
  if (![USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role)) {
    throw new AppError('Only sellers can request withdrawals', 403, ERROR_CODES.FORBIDDEN);
  }
  return { message: 'Withdrawal provider is not integrated yet. Escrow remains protected until payout processing is configured.' };
};

module.exports = {
  listPayments,
  createPayment,
  createCheckoutIntent,
  getCheckoutIntent,
  confirmCheckoutIntent,
  handleFapshiWebhook,
  releasePayment,
  requestWithdrawal,
  createSignedExternalId,
  verifySignedExternalId
};
