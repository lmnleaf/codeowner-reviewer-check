const core = require('@actions/core');
const github = require('@actions/github');

const context = github.context;
const codeownerReviewerCheck = require('../src/codeowner-reviewer-check.js')

async function main() {
  try {
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.getOctokit(token);

    const minReviewers = core.getInput('min_reviewers');
    const ignoreTeams = core.getInput('min_reviewers') || false;

    const reviewerCheck = await codeownerReviewerCheck(
      octokit,
      context,
      minReviewers,
      ignoreTeams
    );

    // log codeowner reviews
    if (reviewerCheck.reviewsNeeded) {
      core.info(reviewerCheck.reviewInfo.info);
      return core.setFailed(reviewerCheck.reviewInfo.error);
    }

    return core.notice(reviewerCheck.reviewInfo.success);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
