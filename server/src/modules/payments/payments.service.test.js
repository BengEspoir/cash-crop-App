const mockSingle = jest.fn();
const mockRpc = jest.fn();
const mockChain = {
  select: jest.fn(() => mockChain),
  eq: jest.fn(() => mockChain),
  single: mockSingle
};

jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => mockChain),
    rpc: mockRpc
  }
}));
jest.mock('../orders/orders.service', () => ({ getOrderRowForAccess: jest.fn() }));
jest.mock('../../utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const service = require('./payments.service');

const admin = { id: '10000000-0000-4000-8000-000000000001', role: 'admin' };
const payment = {
  id: '20000000-0000-4000-8000-000000000002',
  order_id: '30000000-0000-4000-8000-000000000003',
  payer_id: '40000000-0000-4000-8000-000000000004',
  payee_id: '50000000-0000-4000-8000-000000000005',
  amount: 10000,
  currency: 'XAF',
  status: 'held_in_escrow',
  metadata: {}
};
const order = {
  id: payment.order_id,
  status: 'delivered',
  buyer_receipt_status: 'received',
  buyer_received_at: '2026-09-03T10:00:00.000Z'
};

describe('payment escrow release', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects non-admin actors before reading payment state', async () => {
    await expect(service.releasePayment({ id: 'x', role: 'farmer' }, payment.id))
      .rejects.toMatchObject({ statusCode: 403, errorCode: 'FORBIDDEN' });
    expect(mockSingle).not.toHaveBeenCalled();
  });

  test('maps a missing payment to 404', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 404, errorCode: 'NOT_FOUND' });
  });

  test('rejects a pending collection instead of invoking the release RPC', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { ...payment, status: 'pending' }, error: null })
      .mockResolvedValueOnce({ data: order, error: null });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'PAYMENT_INVALID_STATE' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('requires delivery before release', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: payment, error: null })
      .mockResolvedValueOnce({ data: { ...order, status: 'shipped' }, error: null });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'PAYMENT_ORDER_NOT_READY' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('requires explicit buyer receipt before release', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: payment, error: null })
      .mockResolvedValueOnce({ data: { ...order, buyer_receipt_status: 'pending', buyer_received_at: null }, error: null });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'PAYMENT_BUYER_RECEIPT_REQUIRED' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('rejects refunded payments before invoking the release RPC', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { ...payment, status: 'refunded' }, error: null })
      .mockResolvedValueOnce({ data: order, error: null });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'PAYMENT_REFUNDED' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('releases eligible escrow exactly through the atomic RPC', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: payment, error: null })
      .mockResolvedValueOnce({ data: order, error: null });
    mockRpc.mockResolvedValueOnce({
      data: { payment: { ...payment, status: 'released' }, order, released: true },
      error: null
    });
    await expect(service.releasePayment(admin, payment.id, { correlationId: 'request-1' }))
      .resolves.toMatchObject({ id: payment.id, status: 'released', released: true });
    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('release_marketplace_escrow', expect.objectContaining({
      p_payment_id: payment.id,
      p_actor_user_id: admin.id
    }));
  });

  test('returns an explicit conflict for duplicate release attempts', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: { ...payment, status: 'released' }, error: null })
      .mockResolvedValueOnce({ data: order, error: null });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'PAYMENT_ALREADY_RELEASED' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('maps typed database release failures instead of leaking a 500', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: payment, error: null })
      .mockResolvedValueOnce({ data: order, error: null });
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'P0001', message: 'PAYMENT_SELLER_NOT_ELIGIBLE' }
    });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 422, errorCode: 'PAYMENT_SELLER_NOT_ELIGIBLE' });
  });

  test('maps a blocking dispute to an explicit conflict', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: payment, error: null })
      .mockResolvedValueOnce({ data: order, error: null });
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'P0001', message: 'PAYMENT_BLOCKED_BY_DISPUTE' }
    });
    await expect(service.releasePayment(admin, payment.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'PAYMENT_BLOCKED_BY_DISPUTE' });
  });
});
