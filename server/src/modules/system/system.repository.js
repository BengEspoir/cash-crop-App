const { supabaseAdmin } = require('../../config/supabase');
const AppError = require('../../utils/AppError');

const getMaintenanceState = async () => {
  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
};

const updateMaintenanceState = async (updates) => {
  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .update(updates)
    .eq('id', 1)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const createOperationJob = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from('system_operation_jobs')
    .insert(payload)
    .select()
    .single();
  if (error?.code === '23505') {
    throw new AppError('A database operation of this type is already running', 409, 'SYSTEM_OPERATION_IN_PROGRESS');
  }
  if (error) throw error;
  return data;
};

const updateOperationJob = async (id, updates) => {
  const { data, error } = await supabaseAdmin
    .from('system_operation_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const getOperationJob = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('system_operation_jobs')
    .select('*')
    .eq('id', id)
    .single();
  if (error?.code === 'PGRST116') {
    throw new AppError('Database operation not found', 404, 'SYSTEM_OPERATION_NOT_FOUND');
  }
  if (error) throw error;
  return data;
};

const listOperationJobs = async (limit = 20) => {
  const { data, error } = await supabaseAdmin
    .from('system_operation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(50, Math.max(1, Number(limit) || 20)));
  if (error) throw error;
  return data || [];
};

module.exports = {
  getMaintenanceState,
  updateMaintenanceState,
  createOperationJob,
  updateOperationJob,
  getOperationJob,
  listOperationJobs
};
