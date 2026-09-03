const crypto = require('crypto');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { supabaseAdmin } = require('../../config/supabase');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const { logAdminAudit } = require('../../utils/adminAudit');
const repository = require('./system.repository');

const safeJob = (job = {}) => ({
  id: job.id,
  operation: job.operation,
  status: job.status,
  sourceBackupId: job.source_backup_id || null,
  requestedBy: job.requested_by || null,
  backupType: job.metadata?.format || (job.operation === 'backup' ? 'application_logical' : null),
  sizeBytes: Number(job.size_bytes || 0) || null,
  checksumSha256: job.checksum_sha256 || null,
  errorCode: job.error_code || null,
  errorMessage: job.error_message || null,
  startedAt: job.started_at || null,
  finishedAt: job.finished_at || null,
  createdAt: job.created_at || null
});

const commandVersion = (command) => {
  try {
    const result = spawnSync(command, ['--version'], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 5000
    });
    return result.status === 0 ? String(result.stdout || result.stderr || '').trim() : null;
  } catch {
    return null;
  }
};

const getCapability = () => {
  const pgDumpVersion = commandVersion(env.PG_DUMP_PATH);
  const pgRestoreVersion = commandVersion(env.PG_RESTORE_PATH);
  const backupAvailable = Boolean(env.DATABASE_BACKUP_ENABLED && env.DATABASE_URL && pgDumpVersion);
  const restoreAvailable = Boolean(
    backupAvailable &&
    env.DATABASE_RESTORE_ENABLED &&
    pgRestoreVersion
  );
  return {
    providerManagedPreferred: true,
    backup: {
      available: backupAvailable,
      type: backupAvailable ? 'application_logical' : 'provider_managed_or_not_configured',
      message: backupAvailable
        ? 'Backend logical backups are available.'
        : 'Automatic app-triggered backups are not configured. Use Supabase managed backups or configure the Railway pg_dump runtime.',
      toolVersion: pgDumpVersion
    },
    restore: {
      available: restoreAvailable,
      type: restoreAvailable ? 'application_logical' : 'not_configured',
      message: restoreAvailable
        ? 'Backend logical restore is available and still requires maintenance mode plus explicit confirmation.'
        : 'Automatic restore is disabled until DATABASE_RESTORE_ENABLED, DATABASE_URL, and pg_restore are configured.',
      toolVersion: pgRestoreVersion
    }
  };
};

const databaseConnection = () => {
  let parsed;
  try {
    parsed = new URL(env.DATABASE_URL);
  } catch {
    throw new AppError('Database operation connection is not configured', 503, 'DATABASE_OPERATION_NOT_CONFIGURED');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new AppError('Database operation connection is invalid', 503, 'DATABASE_OPERATION_NOT_CONFIGURED');
  }
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  return {
    databaseName,
    processEnv: {
      ...process.env,
      PGHOST: parsed.hostname,
      PGPORT: parsed.port || '5432',
      PGUSER: decodeURIComponent(parsed.username),
      PGPASSWORD: decodeURIComponent(parsed.password),
      PGDATABASE: databaseName,
      PGSSLMODE: parsed.searchParams.get('sslmode') || 'require'
    }
  };
};

const runCommand = (command, args, processEnv) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    env: processEnv,
    windowsHide: true,
    shell: false
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    if (stderr.length < 4000) stderr += chunk.toString();
  });
  child.on('error', () => reject(new Error('Database utility could not be started')));
  child.on('close', (code) => {
    if (code === 0) resolve();
    else reject(new Error('Database utility exited unsuccessfully'));
  });
});

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const privateStoragePath = (jobId) => {
  const day = new Date().toISOString().slice(0, 10);
  return `${day}/${jobId}.dump`;
};

const verifyRestoredDatabase = async () => {
  const maintenance = await repository.getMaintenanceState();
  if (!maintenance?.maintenance_enabled) {
    throw new AppError('Post-restore maintenance safety check failed', 500, 'RESTORE_HEALTH_CHECK_FAILED');
  }
  const { error } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact', head: true });
  if (error) {
    throw new AppError('Post-restore database health check failed', 500, 'RESTORE_HEALTH_CHECK_FAILED');
  }
};

const completeFailure = async (job, user, req, action, error) => {
  const message = error instanceof AppError ? error.message : 'The database operation failed. Review secure server logs.';
  try {
    await repository.updateOperationJob(job.id, {
      status: 'failed',
      error_code: error.errorCode || 'DATABASE_OPERATION_FAILED',
      error_message: message,
      finished_at: new Date().toISOString()
    });
  } catch (statusError) {
    logger.error({ event: 'DATABASE_OPERATION_STATUS_FAILED', jobId: job.id, operation: job.operation, code: statusError.code });
  }
  await logAdminAudit(user, req, action, {
    resourceType: 'system_operation_job',
    resourceId: job.id,
    status: 'failed',
    errorCode: error.errorCode || 'DATABASE_OPERATION_FAILED'
  });
  logger.error({
    event: action,
    jobId: job.id,
    operation: job.operation,
    result: 'failed',
    errorCategory: error.errorCode || error.code || 'DATABASE_OPERATION_FAILED'
  });
};

const runBackup = async (job, user, req) => {
  let temporaryDirectory;
  try {
    await repository.updateOperationJob(job.id, {
      status: 'running',
      started_at: new Date().toISOString()
    });
    await logAdminAudit(user, req, 'DATABASE_BACKUP_STARTED', {
      resourceType: 'system_operation_job',
      resourceId: job.id,
      backupId: job.id
    });
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'agriculnet-backup-'));
    const filePath = path.join(temporaryDirectory, `${job.id}.dump`);
    const { databaseName, processEnv } = databaseConnection();
    await runCommand(env.PG_DUMP_PATH, [
      '--format=custom',
      '--no-owner',
      '--no-acl',
      '--exclude-table=public.system_settings',
      '--exclude-table=public.system_operation_jobs',
      '--file',
      filePath,
      databaseName
    ], processEnv);
    const stat = await fs.stat(filePath);
    if (!stat.size || stat.size > env.DATABASE_BACKUP_MAX_BYTES) {
      throw new AppError('Generated backup exceeded the configured safe size limit', 422, 'BACKUP_SIZE_INVALID');
    }
    const content = await fs.readFile(filePath);
    const checksum = sha256(content);
    const storagePath = privateStoragePath(job.id);
    const { error: uploadError } = await supabaseAdmin.storage
      .from(env.DATABASE_BACKUP_BUCKET)
      .upload(storagePath, content, {
        contentType: 'application/octet-stream',
        upsert: false
      });
    if (uploadError) throw uploadError;
    await repository.updateOperationJob(job.id, {
      status: 'succeeded',
      storage_bucket: env.DATABASE_BACKUP_BUCKET,
      storage_path: storagePath,
      checksum_sha256: checksum,
      size_bytes: stat.size,
      finished_at: new Date().toISOString()
    });
    await logAdminAudit(user, req, 'DATABASE_BACKUP_COMPLETED', {
      resourceType: 'system_operation_job',
      resourceId: job.id,
      backupId: job.id,
      sizeBytes: stat.size,
      status: 'success'
    });
  } catch (error) {
    await completeFailure(job, user, req, 'DATABASE_BACKUP_FAILED', error);
  } finally {
    if (temporaryDirectory) await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
};

const requestBackup = async (user, req) => {
  if (!getCapability().backup.available) {
    await logAdminAudit(user, req, 'DATABASE_BACKUP_FAILED', {
      resourceType: 'system_operation_job',
      status: 'failed',
      errorCode: 'BACKUP_NOT_CONFIGURED'
    });
    throw new AppError('Automatic database backup is not configured for this deployment', 503, 'BACKUP_NOT_CONFIGURED');
  }
  const job = await repository.createOperationJob({
    operation: 'backup',
    status: 'queued',
    requested_by: user.id,
    metadata: { format: 'pg_custom', excludesOperationalControls: true }
  });
  await logAdminAudit(user, req, 'DATABASE_BACKUP_REQUESTED', {
    resourceType: 'system_operation_job',
    resourceId: job.id,
    backupId: job.id
  });
  setImmediate(() => {
    runBackup(job, user, req).catch((error) => logger.error({ event: 'BACKUP_WORKER_FAILED', jobId: job.id, code: error.code }));
  });
  return safeJob(job);
};

const runRestore = async (job, backup, user, req) => {
  let temporaryDirectory;
  try {
    await repository.updateOperationJob(job.id, {
      status: 'running',
      started_at: new Date().toISOString()
    });
    await logAdminAudit(user, req, 'DATABASE_RESTORE_STARTED', {
      resourceType: 'system_operation_job',
      resourceId: job.id,
      backupId: backup.id
    });
    const { data, error: downloadError } = await supabaseAdmin.storage
      .from(backup.storage_bucket)
      .download(backup.storage_path);
    if (downloadError || !data) throw new Error('Approved backup could not be downloaded');
    const content = Buffer.from(await data.arrayBuffer());
    if (content.length > env.DATABASE_BACKUP_MAX_BYTES || sha256(content) !== backup.checksum_sha256) {
      throw new AppError('Backup integrity verification failed', 422, 'BACKUP_INTEGRITY_FAILED');
    }
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'agriculnet-restore-'));
    const filePath = path.join(temporaryDirectory, `${backup.id}.dump`);
    await fs.writeFile(filePath, content, { flag: 'wx' });
    const { databaseName, processEnv } = databaseConnection();
    await runCommand(env.PG_RESTORE_PATH, [
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-acl',
      '--exit-on-error',
      '--dbname',
      databaseName,
      filePath
    ], processEnv);
    await verifyRestoredDatabase();
    await repository.updateOperationJob(job.id, {
      status: 'succeeded',
      checksum_sha256: backup.checksum_sha256,
      size_bytes: content.length,
      finished_at: new Date().toISOString()
    });
    await logAdminAudit(user, req, 'DATABASE_RESTORE_COMPLETED', {
      resourceType: 'system_operation_job',
      resourceId: job.id,
      backupId: backup.id,
      status: 'success'
    });
  } catch (error) {
    await completeFailure(job, user, req, 'DATABASE_RESTORE_FAILED', error);
  } finally {
    if (temporaryDirectory) await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
};

const requestRestore = async (user, req, backupId) => {
  if (!getCapability().restore.available) {
    throw new AppError('Automatic database restore is not configured for this deployment', 503, 'RESTORE_NOT_CONFIGURED');
  }
  const maintenance = await repository.getMaintenanceState();
  if (!maintenance.maintenance_enabled) {
    throw new AppError('Enable maintenance mode before starting a restore', 409, 'MAINTENANCE_REQUIRED');
  }
  const backup = await repository.getOperationJob(backupId);
  if (
    backup.operation !== 'backup' ||
    backup.status !== 'succeeded' ||
    !backup.storage_bucket ||
    !backup.storage_path ||
    !backup.checksum_sha256
  ) {
    throw new AppError('Select a completed AgriculNet backup', 422, 'BACKUP_NOT_RESTORABLE');
  }
  const job = await repository.createOperationJob({
    operation: 'restore',
    status: 'queued',
    requested_by: user.id,
    source_backup_id: backup.id,
    metadata: { confirmationVerified: true }
  });
  await logAdminAudit(user, req, 'DATABASE_RESTORE_REQUESTED', {
    resourceType: 'system_operation_job',
    resourceId: job.id,
    backupId: backup.id
  });
  setImmediate(() => {
    runRestore(job, backup, user, req).catch((error) => logger.error({ event: 'RESTORE_WORKER_FAILED', jobId: job.id, code: error.code }));
  });
  return safeJob(job);
};

const listJobs = async (limit) => (await repository.listOperationJobs(limit)).map(safeJob);
const getJob = async (id) => safeJob(await repository.getOperationJob(id));

module.exports = {
  getCapability,
  requestBackup,
  requestRestore,
  listJobs,
  getJob,
  safeJob
};
