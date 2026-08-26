const AppError = require('../../utils/AppError');
const { ERROR_CODES, USER_ROLES } = require('../../config/constants');
const { supabaseAdmin } = require('../../config/supabase');
const { formatCurrency } = require('../../utils/marketplace');
const ordersService = require('../orders/orders.service');
const repository = require('./logistics.repository');

const isAdmin = (user) => [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role);
const COMMISSION_PER_KG_XAF = 200;

const normalizeText = (value) => String(value || '').trim();

const buildLane = ({ originCity, originRegion, destinationCity, destinationRegion }) => {
  const origin = [originCity, originRegion].filter(Boolean).join(', ');
  const destination = [destinationCity, destinationRegion].filter(Boolean).join(', ');
  return [origin || 'Origin pending', destination || 'Destination pending'].join(' to ');
};

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

const assignShipment = async (user, shipmentId, payload) => {
  if (!isAdmin(user)) {
    throw new AppError('Only admins can assign shipment operations', 403, ERROR_CODES.FORBIDDEN);
  }

  const shipment = await repository.getShipmentById(shipmentId);
  const order = await ordersService.getOrderRowForAccess(user, shipment.order_id);
  const truck = payload.truckId ? await repository.getTruckById(payload.truckId) : null;
  const nextStatus = payload.dispatchNow ? 'in_transit' : 'assigned';
  const { data, error } = await supabaseAdmin.rpc('transition_logistics_shipment', {
    p_shipment_id: shipment.id,
    p_expected_status: shipment.status,
    p_next_status: nextStatus,
    p_operation: 'assign',
    p_actor_user_id: user.id,
    p_event: payload.dispatchNow ? 'Shipment departed origin' : 'Shipment assigned to operations',
    p_location_label: shipment.current_location || null,
    p_estimated_arrival: payload.estimatedArrival || null,
    p_assignment: {
      truckId: truck?.id || null,
      carrierName: payload.carrierName || truck?.carrier_name || null,
      trackingNumber: payload.trackingNumber || shipment.tracking_number || null,
      driverName: payload.driverName || truck?.driver_name || null,
      driverPhone: payload.driverPhone || truck?.driver_phone || null
    },
    p_position: {},
    p_occurred_at: new Date().toISOString()
  });
  if (error) throw error;
  const updated = data.shipment;

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
  const status = payload.status || (shipment.status === 'assigned' ? 'in_transit' : shipment.status);
  const occurredAt = payload.capturedAt || new Date().toISOString();
  const { data, error } = await supabaseAdmin.rpc('transition_logistics_shipment', {
    p_shipment_id: shipment.id,
    p_expected_status: shipment.status,
    p_next_status: status,
    p_operation: 'position',
    p_actor_user_id: user.id,
    p_event: status === 'near_destination' ? 'Shipment is near destination' : 'Shipment position updated',
    p_location_label: payload.locationLabel || shipment.current_location || null,
    p_estimated_arrival: null,
    p_assignment: {},
    p_position: {
      latitude: payload.latitude,
      longitude: payload.longitude,
      speedKph: payload.speedKph ?? null,
      heading: payload.heading ?? null,
      metadata: payload.metadata || {}
    },
    p_occurred_at: occurredAt
  });
  if (error) throw error;
  const updated = data.shipment;

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
  const { data, error } = await supabaseAdmin.rpc('transition_logistics_shipment', {
    p_shipment_id: shipment.id,
    p_expected_status: shipment.status,
    p_next_status: payload.status,
    p_operation: 'status',
    p_actor_user_id: user.id,
    p_event: payload.note || `Shipment marked ${payload.status}`,
    p_location_label: payload.locationLabel || shipment.current_location || null,
    p_estimated_arrival: payload.estimatedArrival || null,
    p_assignment: {},
    p_position: {},
    p_occurred_at: new Date().toISOString()
  });
  if (error) throw error;
  const updated = data.shipment;

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
  assignShipment,
  updateShipmentPosition,
  updateShipmentStatus,
  calculatePlatformCommission
};
