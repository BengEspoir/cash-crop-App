const path = require('path');
const crypto = require('crypto');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../config/constants');
const { supabaseAdmin } = require('../../config/supabase');
const env = require('../../config/env');

const allowedFolders = new Set(['profiles', 'listings', 'support']);

const extensionForFile = (file) => {
  const fromName = path.extname(file.originalname || '').toLowerCase();
  if (fromName) return fromName;
  if (file.mimetype === 'image/png') return '.png';
  if (file.mimetype === 'image/webp') return '.webp';
  return '.jpg';
};

const safeFolder = (value) => {
  const folder = String(value || 'profiles').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  return allowedFolders.has(folder) ? folder : 'profiles';
};

const uploadAsset = async (user, file, body = {}) => {
  if (!file) {
    throw new AppError('Image file is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const bucket = env.SUPABASE_ASSETS_BUCKET;
  const folder = safeFolder(body.folder);
  const storagePath = `${folder}/${user.id}/${Date.now()}-${crypto.randomUUID()}${extensionForFile(file)}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '31536000',
      upsert: false
    });

  if (error) {
    throw new AppError(
      `Asset upload failed. Confirm the public Supabase bucket "${bucket}" exists.`,
      500,
      ERROR_CODES.SERVER_ERROR,
      { storage: error.message }
    );
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
  return {
    bucket,
    path: storagePath,
    url: data.publicUrl,
    contentType: file.mimetype,
    size: file.size
  };
};

module.exports = {
  uploadAsset
};
