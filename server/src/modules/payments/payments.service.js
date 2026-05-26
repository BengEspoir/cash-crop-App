const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const { isBuyerRole, mapPayment } = require('../../utils/marketplace');
const ordersService = require('../orders/orders.service');

const isNotFound = (error) => error?.code === 'PGRST116';

const getUserProfile = async (table, userId) => {
  const { data, error } = await supabaseAdmin.from(table).select('*').eq('user_id', userId).single();
  if (error && isNotFound(error)) throw new AppError('Profile not found', 404, ERROR_CODES.NOT_FOUND);
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
        mode: 'internal_ledger',
        note: 'No live payment provider was charged for this record.'
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
  status: payment.status || 'pending',
  message: 'Payment provider is not configured yet. An internal ledger payment record was prepared.'
});

const createCheckoutIntent = async (user, payload) => {
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can create checkout intents', 403, ERROR_CODES.FORBIDDEN);
  }

  const order = await ordersService.getOrderRowForAccess(user, payload.orderId);
  const existing = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('order_id', order.id)
    .eq('payer_id', user.id)
    .in('status', ['pending', 'held_in_escrow'])
    .order('created_at', { ascending: false })
    .limit(1);
  if (existing.error) throw existing.error;
  if (existing.data?.[0]) return mapCheckoutIntent(existing.data[0], order);

  const payment = await createPayment(user, {
    orderId: order.id,
    channel: payload.channel || 'bank_transfer'
  });

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      metadata: {
        provider: payload.provider || 'internal_ledger',
        providerReference: null,
        checkoutUrl: null,
        nextAction: 'provider_not_configured',
        mode: 'provider_ready_stub',
        note: 'No live payment provider was charged for this record.'
      }
    })
    .eq('id', payment.id)
    .select()
    .single();
  if (error) throw error;
  return mapCheckoutIntent(data, order);
};

const getCheckoutIntent = async (user, intentId) => {
  const { data, error } = await supabaseAdmin.from('payments').select('*').eq('id', intentId).single();
  if (error && isNotFound(error)) throw new AppError('Checkout intent not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  await ordersService.getOrderRowForAccess(user, data.order_id);
  const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('*').eq('id', data.order_id).single();
  if (orderError) throw orderError;
  return mapCheckoutIntent(data, order);
};

const confirmCheckoutIntent = async (user, intentId) => {
  const { data: payment, error } = await supabaseAdmin.from('payments').select('*').eq('id', intentId).single();
  if (error && isNotFound(error)) throw new AppError('Checkout intent not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;
  const order = await ordersService.getOrderRowForAccess(user, payment.order_id);
  if (!isBuyerRole(user.role)) {
    throw new AppError('Only buyers can confirm checkout intents', 403, ERROR_CODES.FORBIDDEN);
  }
  const { data, error: updateError } = await supabaseAdmin
    .from('payments')
    .update({
      metadata: {
        ...(payment.metadata || {}),
        nextAction: 'provider_not_configured',
        confirmedAt: new Date().toISOString()
      }
    })
    .eq('id', intentId)
    .select()
    .single();
  if (updateError) throw updateError;
  return mapCheckoutIntent(data, order);
};

const releasePayment = async (user, paymentId) => {
  if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
    throw new AppError('Only admins can release internal ledger payments', 403, ERROR_CODES.FORBIDDEN);
  }

  const { data: payment, error } = await supabaseAdmin.from('payments').select('*').eq('id', paymentId).single();
  if (error && isNotFound(error)) throw new AppError('Payment not found', 404, ERROR_CODES.NOT_FOUND);
  if (error) throw error;

  const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('*').eq('id', payment.order_id).single();
  if (orderError) throw orderError;

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
  releasePayment,
  requestWithdrawal
};
