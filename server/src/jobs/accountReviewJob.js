/**
 * Automated account review job
 * Legacy safety net for accounts that remain in PENDING_REVIEW.
 * Standard buyer onboarding now becomes ACTIVE after phone and email verification.
 * Farmers remain in PENDING_REVIEW for manual admin approval.
 */

const { supabaseAdmin } = require('../config/supabase');
const { USER_STATUS, USER_ROLES } = require('../config/constants');
const mailer = require('../utils/mailer');

const REVIEW_DELAY_MINUTES = 5;

/**
 * Find legacy buyer accounts pending review for more than the delay period.
 * Farmers are excluded because they require manual admin approval.
 */
const findUsersToApprove = async () => {
  const cutoffTime = new Date(Date.now() - REVIEW_DELAY_MINUTES * 60 * 1000).toISOString();
  
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email, first_name, role, phone_verified, email_verified, created_at')
    .eq('status', USER_STATUS.PENDING_REVIEW)
    .in('role', [USER_ROLES.LOCAL_BUYER, USER_ROLES.INTERNATIONAL_BUYER]) // Only buyers, not farmers
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
 * Only touches legacy buyer accounts that still sit in PENDING_REVIEW.
 */
const runAccountReviewJob = async () => {
  console.log('[AccountReviewJob] Starting review cycle (buyers only)...');
  
  const usersToApprove = await findUsersToApprove();
  
  if (usersToApprove.length === 0) {
    console.log('[AccountReviewJob] No buyers to approve');
    return { processed: 0, successful: 0, failed: 0 };
  }
  
  console.log(`[AccountReviewJob] Found ${usersToApprove.length} buyer(s) to auto-approve`);
  
  const results = await Promise.all(
    usersToApprove.map(user => approveUser(user))
  );
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`[AccountReviewJob] Completed: ${successful} approved, ${failed} failed`);
  console.log('[AccountReviewJob] Note: Farmers are not auto-approved and require manual admin review');
  
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
