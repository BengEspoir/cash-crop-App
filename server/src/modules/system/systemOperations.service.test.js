const mockGetMaintenanceState = jest.fn();
const mockGetOperationJob = jest.fn();
const mockCreateOperationJob = jest.fn();
const mockLogAdminAudit = jest.fn();

jest.mock('child_process', () => ({
  spawn: jest.fn(),
  spawnSync: jest.fn(() => ({ status: 0, stdout: 'PostgreSQL utility 16' }))
}));
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: { storage: { from: jest.fn() } }
}));
jest.mock('../../config/env', () => ({
  DATABASE_BACKUP_ENABLED: true,
  DATABASE_RESTORE_ENABLED: true,
  DATABASE_URL: 'postgresql://user:password@db.example.com:5432/agriculnet',
  DATABASE_BACKUP_BUCKET: 'private-backups',
  DATABASE_BACKUP_MAX_BYTES: 1000000,
  PG_DUMP_PATH: 'pg_dump',
  PG_RESTORE_PATH: 'pg_restore'
}));
jest.mock('../../utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));
jest.mock('../../utils/adminAudit', () => ({ logAdminAudit: mockLogAdminAudit }));
jest.mock('./system.repository', () => ({
  getMaintenanceState: mockGetMaintenanceState,
  getOperationJob: mockGetOperationJob,
  createOperationJob: mockCreateOperationJob,
  updateOperationJob: jest.fn(),
  listOperationJobs: jest.fn()
}));

const operations = require('./systemOperations.service');
const { restoreSchema } = require('./system.validators');

const user = { id: '10000000-0000-4000-8000-000000000001', role: 'admin' };
const request = { ip: '127.0.0.1', headers: { 'user-agent': 'jest' } };
const backup = {
  id: '20000000-0000-4000-8000-000000000002',
  operation: 'backup',
  status: 'succeeded',
  storage_bucket: 'private-backups',
  storage_path: '2026-09-02/backup.dump',
  checksum_sha256: 'a'.repeat(64)
};

describe('database restore safeguards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'setImmediate').mockImplementation(() => 1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('requires maintenance before reading a backup record', async () => {
    mockGetMaintenanceState.mockResolvedValue({ maintenance_enabled: false });

    await expect(operations.requestRestore(user, request, backup.id))
      .rejects.toMatchObject({ statusCode: 409, errorCode: 'MAINTENANCE_REQUIRED' });
    expect(mockGetOperationJob).not.toHaveBeenCalled();
    expect(mockCreateOperationJob).not.toHaveBeenCalled();
  });

  test('rejects a job that is not a completed internal backup', async () => {
    mockGetMaintenanceState.mockResolvedValue({ maintenance_enabled: true });
    mockGetOperationJob.mockResolvedValue({ ...backup, operation: 'restore' });

    await expect(operations.requestRestore(user, request, backup.id))
      .rejects.toMatchObject({ statusCode: 422, errorCode: 'BACKUP_NOT_RESTORABLE' });
    expect(mockCreateOperationJob).not.toHaveBeenCalled();
  });

  test('queues a restore only from a completed internal backup', async () => {
    const restoreJob = {
      id: '30000000-0000-4000-8000-000000000003',
      operation: 'restore',
      status: 'queued',
      source_backup_id: backup.id
    };
    mockGetMaintenanceState.mockResolvedValue({ maintenance_enabled: true });
    mockGetOperationJob.mockResolvedValue(backup);
    mockCreateOperationJob.mockResolvedValue(restoreJob);

    await expect(operations.requestRestore(user, request, backup.id))
      .resolves.toMatchObject({
        id: restoreJob.id,
        operation: 'restore',
        status: 'queued',
        sourceBackupId: backup.id
      });
    expect(mockCreateOperationJob).toHaveBeenCalledWith(expect.objectContaining({
      operation: 'restore',
      source_backup_id: backup.id,
      requested_by: user.id
    }));
    expect(mockLogAdminAudit).toHaveBeenCalledWith(
      user,
      request,
      'DATABASE_RESTORE_REQUESTED',
      expect.objectContaining({ backupId: backup.id })
    );
  });

  test('requires the exact restore confirmation phrase at validation', () => {
    expect(restoreSchema.validate({ backupId: backup.id, confirmation: 'RESTORE AGRICULNET' }).error)
      .toBeUndefined();
    expect(restoreSchema.validate({ backupId: backup.id, confirmation: 'restore agriculnet' }).error)
      .toBeDefined();
  });
});
