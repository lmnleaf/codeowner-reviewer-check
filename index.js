const core = require('@actions/core');
const github = require('@actions/github');

const context = github.context;
const codeownerReviewerCheck = require('../src/codeowner-reviewer-check.js')

async function main() {
  try {
    const token = core.getInput('TOKEN');
    const octokit = new github.getOctokit(token);

    const minReviewers = core.getInput('min_reviewers');
    const includeTeams = core.getInput('include_teams') || false;

    const reviewerCheck = await codeownerReviewerCheck(
      octokit,
      context,
      minReviewers,
      includeTeams
    );

    // log codeowner reviews
    core.info(reviewerCheck.reviewInfo.info);

    if (reviewerCheck.reviewsNeeded) {
      return core.setFailed(reviewerCheck.reviewInfo.error);
    }

    return core.notice(reviewerCheck.reviewInfo.success);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
