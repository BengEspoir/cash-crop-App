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
  releasePayment,
  requestWithdrawal
};
