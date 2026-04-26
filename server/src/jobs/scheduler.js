/**
 * Job scheduler for background tasks
 * Runs automated jobs on intervals
 */

const { runAccountReviewJob } = require('./accountReviewJob');

const SCHEDULES = {
  ACCOUNT_REVIEW: 60 * 1000, // Every minute
};

class JobScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('[Scheduler] Already running');
      return;
    }

    console.log('[Scheduler] Starting job scheduler...');
    this.isRunning = true;

    // Schedule account review job
    this.scheduleJob('accountReview', SCHEDULES.ACCOUNT_REVIEW, runAccountReviewJob);

    console.log('[Scheduler] All jobs scheduled');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('[Scheduler] Stopping job scheduler...');
    this.jobs.forEach((intervalId, name) => {
      clearInterval(intervalId);
      console.log(`[Scheduler] Stopped job: ${name}`);
    });
    this.jobs.clear();
    this.isRunning = false;
  }

  /**
   * Schedule a job with error handling
   */
  scheduleJob(name, intervalMs, jobFn) {
    console.log(`[Scheduler] Scheduling job "${name}" to run every ${intervalMs}ms`);

    // Run immediately on start
    this.runJobSafely(name, jobFn);

    // Then schedule interval
    const intervalId = setInterval(() => {
      this.runJobSafely(name, jobFn);
    }, intervalMs);

    this.jobs.set(name, intervalId);
  }

  /**
   * Run a job with error handling
   */
  async runJobSafely(name, jobFn) {
    try {
      const result = await jobFn();
      if (result && result.processed > 0) {
        console.log(`[Scheduler] Job "${name}" completed:`, result);
      }
    } catch (error) {
      console.error(`[Scheduler] Job "${name}" failed:`, error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledJobs: Array.from(this.jobs.keys())
    };
  }
}

// Singleton instance
const scheduler = new JobScheduler();

module.exports = {
  JobScheduler,
  scheduler
};
