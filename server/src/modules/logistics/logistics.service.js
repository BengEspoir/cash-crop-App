const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const { supabaseAdmin } = require('../../config/supabase');
const { formatCurrency, isBuyerRole, mapUserName } = require('../../utils/marketplace');
const ordersService = require('../orders/orders.service');
const repository = require('./logistics.repository');

const isAdmin = (user) => [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role);
const isSeller = (user) => [USER_ROLES.FARMER, USER_ROLES.RESELLER].includes(user.role);
const COMMISSION_PER_KG_XAF = 200;

const normalizeText = (value) => String(value || '').trim();

const generateTrackingNumber = () => `AGN-TRK-${Date.now().toString(36).toUpperCase()}`;

const buildLane = ({ originCity, originRegion, destinationCity, destinationRegion }) => {
  const origin = [originCity, originRegion].filter(Boolean).join(', ');
  const destination = [destinationCity, destinationRegion].filter(Boolean).join(', ');
  return [origin || 'Origin pending', destination || 'Destination pending'].join(' to ');
};

const appendHistory = (details = [], event) => [
  ...(Array.isArray(details) ? details : []),
  {
    event: event.event,
    status: event.status,
    location: event.location || null,
    date: event.date || new Date().toISOString()
  }
];

const mapPosition = (row) => ({
  id: row.id,
  latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
  longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
  locationLabel: row.location_label || '',
  speedKph: row.speed_kph !== null && row.speed_kph !== undefined ? Number(row.speed_kph) : null,
  heading: row.heading !== null && row.heading !== undefined ? Number(row.heading) : null,
  capturedAt: row.captured_at,
  metadata: row.metadata || {}
});

const mapShipment = (row, extras = {}) => ({
  id: row.id,
  orderId: row.order_id,
  trackingNumber: row.tracking_number,
  lane: row.lane || buildLane(row),
  status: row.status || 'pending_dispatch',
  carrierName: row.carrier_name || extras.truck?.carrier_name || 'AgriculNet Logistics',
  truck: extras.truck ? {
    id: extras.truck.id,
    displayName: extras.truck.display_name,
    plateNumber: extras.truck.plate_number,
    ownerType: extras.truck.owner_type,
    driverName: extras.truck.driver_name,
    driverPhone: extras.truck.driver_phone
  } : null,
  driverName: extras.truck?.driver_name || row.metadata?.driverName || null,
  driverPhone: extras.truck?.driver_phone || row.metadata?.driverPhone || null,
  currentLocation: row.current_location || row.destination_city || row.destination_region || 'Awaiting dispatch',
  currentPosition: row.current_latitude !== null && row.current_longitude !== null
    ? { latitude: Number(row.current_latitude), longitude: Number(row.current_longitude) }
    : null,
  lastPositionAt: row.last_position_at || null,
  originRegion: row.origin_region || null,
  originCity: row.origin_city || null,
  destinationRegion: row.destination_region || null,
  destinationCity: row.destination_city || null,
  logisticsFee: Number(row.logistics_fee || 0),
  logisticsFeeLabel: formatCurrency(row.logistics_fee || 0, 'XAF'),
  estimatedArrival: row.estimated_arrival || null,
  dispatchedAt: row.dispatched_at || null,
  deliveredAt: row.delivered_at || null,
  history: Array.isArray(row.details) ? row.details : [],
  positions: (extras.positions || []).map(mapPosition),
  metadata: row.metadata || {}
});

const ensureShipmentAccess = async (user, shipment) => {
  if (isAdmin(user)) return shipment;

  const order = await ordersService.getOrderRowForAccess(user, shipment.order_id);
  if (!order) {
    throw new AppError('Shipment not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return shipment;
};

const createShipmentNotification = async (shipment, order, title, content, status) => {
  const buyerProfile = await repository.getBuyerProfileById(order.buyer_id);
  return repository.createNotification({
    userId: buyerProfile.user_id,
    type: 'order_update',
    title,
    content,
    link: `/buyer/orders/${order.id}`,
    priority: status === 'delivered' ? 'high' : 'normal',
    entityType: 'logistics',
    entityId: shipment.id,
    metadata: {
      orderId: order.id,
      trackingNumber: shipment.tracking_number,
      shipmentStatus: status
    }
  });
};

const estimateLogisticsFee = async ({ originRegion, originCity, destinationRegion, destinationCity }) => {
  if (!normalizeText(originRegion) || !normalizeText(destinationRegion)) {
    return {
      fee: 0,
      currency: 'XAF',
      matched: false,
      lane: buildLane({ originCity, originRegion, destinationCity, destinationRegion }),
      message: 'Origin and destination regions are required to estimate logistics.'
    };
  }

  const rate = await repository.findLogisticsRate({
    originRegion: normalizeText(originRegion),
    originCity: normalizeText(originCity) || null,
    destinationRegion: normalizeText(destinationRegion),
    destinationCity: normalizeText(destinationCity) || null
  });

  if (!rate) {
    return {
      fee: 0,
      currency: 'XAF',
      matched: false,
      lane: buildLane({ originCity, originRegion, destinationCity, destinationRegion }),
      message: 'No AgriculNet logistics lane is configured for this route yet.'
    };
  }

  return {
    fee: Number(rate.fee_amount || 0),
    currency: rate.currency || 'XAF',
    matched: true,
    lane: buildLane({ originCity, originRegion, destinationCity, destinationRegion }),
    rate
  };
};

const listShipments = async (user, filters = {}) => {
  let rows;

  if (isAdmin(user)) {
    rows = await repository.listShipments(
      supabaseAdmin
        .from('logistics')
        .select('*')
        .order('updated_at', { ascending: false })
    );
  } else {
    const { items: orders } = await ordersService.listOrders(user);
    const orderIds = orders.map((order) => order.rawId);
    rows = orderIds.length
      ? await repository.listShipments(
        supabaseAdmin
          .from('logistics')
          .select('*')
          .in('order_id', orderIds)
          .order('updated_at', { ascending: false })
      )
      : [];
  }

  const filtered = filters.orderId ? rows.filter((row) => row.order_id === filters.orderId) : rows;
  const truckIds = filtered.map((row) => row.truck_id).filter(Boolean);
  const trucks = truckIds.length
    ? await repository.listTrucks().then((items) => items.reduce((acc, truck) => {
      acc[truck.id] = truck;
      return acc;
    }, {}))
    : {};

  return {
    items: filtered.map((row) => mapShipment(row, { truck: trucks[row.truck_id] || null })),
    count: filtered.length
  };
};

const getShipmentByOrder = async (user, orderId) => {
  const order = await ordersService.getOrderRowForAccess(user, orderId);
  const shipment = await repository.getShipmentByOrderId(order.id);
  if (!shipment) return null;
  const positions = await repository.listPositions(shipment.id);
  const truck = shipment.truck_id ? await repository.getTruckById(shipment.truck_id) : null;
  return mapShipment(shipment, { positions, truck });
};

const getShipment = async (user, shipmentId) => {
  const shipment = await repository.getShipmentById(shipmentId);
  await ensureShipmentAccess(user, shipment);
  const positions = await repository.listPositions(shipment.id);
  const truck = shipment.truck_id ? await repository.getTruckById(shipment.truck_id) : null;
  return mapShipment(shipment, { positions, truck });
};

const ensureShipmentForPaidOrder = async (order) => {
  if (!order.logistics_required) return null;

  const existing = await repository.getShipmentByOrderId(order.id);
  if (existing) return existing;

  const sellerTable = order.reseller_id ? 'reseller_profiles' : 'farmer_profiles';
  const sellerProfile = await repository.getSellerProfile(sellerTable, order.reseller_id || order.farmer_id);
  const buyerProfile = await repository.getBuyerProfileById(order.buyer_id);
  const users = await repository.getUsersByIds([sellerProfile.user_id, buyerProfile.user_id]);
  const sellerUser = users[sellerProfile.user_id];
  const buyerUser = users[buyerProfile.user_id];

  const originRegion = order.metadata?.originRegion || sellerUser?.region || null;
  const originCity = order.metadata?.originCity || sellerUser?.city || null;
  const destinationRegion = order.metadata?.destinationRegion || buyerUser?.region || null;
  const destinationCity = order.metadata?.destinationCity || buyerUser?.city || null;

  const shipment = await repository.createShipment({
    order_id: order.id,
    lane: buildLane({ originCity, originRegion, destinationCity, destinationRegion }),
    status: 'pending_dispatch',
    tracking_number: generateTrackingNumber(),
    carrier_name: 'AgriculNet Logistics',
    current_location: [originCity, originRegion].filter(Boolean).join(', ') || 'Origin pending',
    origin_region: originRegion,
    origin_city: originCity,
    destination_region: destinationRegion,
    destination_city: destinationCity,
    logistics_fee: Number(order.logistics_fee || 0),
    details: [
      {
        event: 'Shipment record created',
        status: 'pending_dispatch',
        location: [originCity, originRegion].filter(Boolean).join(', ') || null,
        date: new Date().toISOString()
      }
    ],
    metadata: {
      buyerId: buyerProfile.user_id,
      sellerId: sellerProfile.user_id,
      destinationAddress: order.shipping_address || null
    }
  });

  await createShipmentNotification(
    shipment,
    order,
    `Shipment created for ${order.order_number || order.id}`,
    `AgriculNet opened a shipment lane for ${buildLane({ originCity, originRegion, destinationCity, destinationRegion })}.`,
    'pending_dispatch'
  );

  return shipment;
};

const assignShipment = async (user, shipmentId, payload) => {
  if (!isAdmin(user)) {
    throw new AppError('Only admins can assign shipment operations', 403, ERROR_CODES.FORBIDDEN);
  }

  const shipment = await repository.getShipmentById(shipmentId);
  const order = await ordersService.getOrderRowForAccess(user, shipment.order_id);
  const truck = payload.truckId ? await repository.getTruckById(payload.truckId) : null;
  const nextHistory = appendHistory(shipment.details, {
    event: 'Shipment assigned to operations',
    status: 'assigned',
    location: shipment.current_location || null
  });

  const updated = await repository.updateShipment(shipment.id, {
    truck_id: truck?.id || null,
    assigned_by: user.id,
    carrier_name: payload.carrierName || truck?.carrier_name || shipment.carrier_name || 'AgriculNet Logistics',
    tracking_number: payload.trackingNumber || shipment.tracking_number || generateTrackingNumber(),
    estimated_arrival: payload.estimatedArrival || shipment.estimated_arrival || null,
    status: payload.dispatchNow ? 'in_transit' : 'assigned',
    dispatched_at: payload.dispatchNow ? new Date().toISOString() : shipment.dispatched_at,
    details: payload.dispatchNow
      ? appendHistory(nextHistory, {
        event: 'Shipment departed origin',
        status: 'in_transit',
        location: shipment.current_location || null
      })
      : nextHistory,
    metadata: {
      ...(shipment.metadata || {}),
      driverName: payload.driverName || truck?.driver_name || shipment.metadata?.driverName || null,
      driverPhone: payload.driverPhone || truck?.driver_phone || shipment.metadata?.driverPhone || null
    }
  });

  await createShipmentNotification(
    updated,
    order,
    payload.dispatchNow ? `Shipment departed: ${updated.tracking_number}` : `Shipment assigned: ${updated.tracking_number}`,
    payload.dispatchNow
      ? 'Your goods are now in transit. Open the order tracking view to follow movement updates.'
      : 'AgriculNet assigned a truck and driver to your shipment.',
    payload.dispatchNow ? 'in_transit' : 'assigned'
  );

  return getShipment(user, updated.id);
};

const updateShipmentPosition = async (user, shipmentId, payload) => {
  if (!isAdmin(user)) {
    throw new AppError('Only admins can post shipment positions in v1', 403, ERROR_CODES.FORBIDDEN);
  }

  const shipment = await repository.getShipmentById(shipmentId);
  const order = await ordersService.getOrderRowForAccess(user, shipment.order_id);
  await repository.createPosition({
    logistics_id: shipment.id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    location_label: payload.locationLabel || shipment.current_location || null,
    speed_kph: payload.speedKph || null,
    heading: payload.heading || null,
    captured_at: payload.capturedAt || new Date().toISOString(),
    metadata: payload.metadata || {}
  });

  const status = payload.status || shipment.status || 'in_transit';
  const updated = await repository.updateShipment(shipment.id, {
    status,
    current_location: payload.locationLabel || shipment.current_location || null,
    current_latitude: payload.latitude,
    current_longitude: payload.longitude,
    last_position_at: payload.capturedAt || new Date().toISOString(),
    dispatched_at: shipment.dispatched_at || (status === 'in_transit' ? new Date().toISOString() : null),
    details: appendHistory(shipment.details, {
      event: payload.status === 'near_destination' ? 'Shipment is near destination' : 'Shipment position updated',
      status,
      location: payload.locationLabel || shipment.current_location || null,
      date: payload.capturedAt || new Date().toISOString()
    })
  });

  if (payload.status === 'near_destination') {
    await createShipmentNotification(
      updated,
      order,
      `Shipment near destination: ${updated.tracking_number}`,
      'Your shipment is near the delivery warehouse. Final arrival confirmation will follow shortly.',
      'near_destination'
    );
  }

  return getShipment(user, updated.id);
};

const updateShipmentStatus = async (user, shipmentId, payload) => {
  if (!isAdmin(user)) {
    throw new AppError('Only admins can update shipment status', 403, ERROR_CODES.FORBIDDEN);
  }

  const shipment = await repository.getShipmentById(shipmentId);
  const order = await ordersService.getOrderRowForAccess(user, shipment.order_id);
  const details = appendHistory(shipment.details, {
    event: payload.note || `Shipment marked ${payload.status}`,
    status: payload.status,
    location: payload.locationLabel || shipment.current_location || null
  });

  const updates = {
    status: payload.status,
    current_location: payload.locationLabel || shipment.current_location || null,
    estimated_arrival: payload.estimatedArrival || shipment.estimated_arrival || null,
    details
  };

  if (payload.status === 'in_transit' && !shipment.dispatched_at) {
    updates.dispatched_at = new Date().toISOString();
  }

  if (payload.status === 'delivered') {
    updates.delivered_at = new Date().toISOString();
  }

  const updated = await repository.updateShipment(shipment.id, updates);

  const orderStatus = payload.status === 'delivered'
    ? 'delivered'
    : payload.status === 'in_transit'
      ? 'in_transit'
      : payload.status === 'assigned'
        ? 'processing'
        : null;

  if (orderStatus && order.status !== orderStatus) {
    await ordersService.updateOrderStatus(user, order.id, orderStatus);
  }

  await createShipmentNotification(
    updated,
    order,
    payload.status === 'delivered'
      ? `Shipment delivered: ${updated.tracking_number}`
      : `Shipment update: ${updated.tracking_number}`,
    payload.status === 'delivered'
      ? 'Your AgriculNet shipment has arrived at the destination warehouse.'
      : payload.note || `Shipment status is now ${payload.status.replace(/_/g, ' ')}.`,
    payload.status
  );

  return getShipment(user, updated.id);
};

const calculatePlatformCommission = ({ quantity, quantityUnit }) => {
  const normalizedUnit = String(quantityUnit || 'kg').toLowerCase();
  const kgQuantity = normalizedUnit === 'kg' ? Number(quantity || 0) : Number(quantity || 0);
  return Number.isFinite(kgQuantity) ? kgQuantity * COMMISSION_PER_KG_XAF : 0;
};

module.exports = {
  COMMISSION_PER_KG_XAF,
  estimateLogisticsFee,
  listShipments,
  getShipmentByOrder,
  getShipment,
  ensureShipmentForPaidOrder,
  assignShipment,
  updateShipmentPosition,
  updateShipmentStatus,
  calculatePlatformCommission
};
