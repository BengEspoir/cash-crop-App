/**
 * Automated account review job
 * Automatically approves users after 5-minute review period
 */

const { supabaseAdmin } = require('../config/supabase');
const { USER_STATUS, USER_ROLES } = require('../config/constants');
const mailer = require('../utils/mailer');

const REVIEW_DELAY_MINUTES = 5;

/**
 * Find users pending review for more than the delay period
 */
const findUsersToApprove = async () => {
  const cutoffTime = new Date(Date.now() - REVIEW_DELAY_MINUTES * 60 * 1000).toISOString();
  
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email, first_name, role, phone_verified, email_verified, created_at')
    .eq('status', USER_STATUS.PENDING_REVIEW)
    .lt('created_at', cutoffTime)
    .order('created_at', { ascending: true })
    .limit(100);
  
  if (error) {
    console.error('[AccountReviewJob] Error fetching users:', error);
    return [];
  }
  
  return users || [];
};

/**
 * Approve a single user
 */
const approveUser = async (user) => {
  try {
    // Update user status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        status: USER_STATUS.ACTIVE,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }
    
    // Send approval email
    if (user.email) {
      await mailer.sendAccountApprovedEmail(
        user.email,
        user.first_name,
        user.role
      );
    }
    
    console.log(`[AccountReviewJob] Approved user ${user.id} (${user.email})`);
    
    return { success: true, userId: user.id };
  } catch (error) {
    console.error(`[AccountReviewJob] Failed to approve user ${user.id}:`, error.message);
    return { success: false, userId: user.id, error: error.message };
  }
};

/**
 * Main job execution
 */
const runAccountReviewJob = async () => {
  console.log('[AccountReviewJob] Starting review cycle...');
  
  const usersToApprove = await findUsersToApprove();
  
  if (usersToApprove.length === 0) {
    console.log('[AccountReviewJob] No users to approve');
    return { processed: 0, successful: 0, failed: 0 };
  }
  
  console.log(`[AccountReviewJob] Found ${usersToApprove.length} users to approve`);
  
  const results = await Promise.all(
    usersToApprove.map(user => approveUser(user))
  );
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`[AccountReviewJob] Completed: ${successful} approved, ${failed} failed`);
  
  return {
    processed: usersToApprove.length,
    successful,
    failed
  };
};

module.exports = {
  runAccountReviewJob,
  REVIEW_DELAY_MINUTES
};
