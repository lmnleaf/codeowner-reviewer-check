const core = require('@actions/core');
const github = require('@actions/github');
const getCodeownerContent = require('../src/get-codeowner-content.js');
const prepareCodeownerContent = require('../src/prepare-codeowner-content.js');
const setRequiredReviewers = require('../src/set-required-reviewers.js');
const compareReviewers = require('../src/compare-reviewers.js');
const prepareReviewInfo = require('../src/prepare-review-info.js');

const context = github.context;

async function main() {
  try {
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.getOctokit(token);

    const minReviewers = core.getInput('min_reviewers');
    const ignoreTeams = core.getInput('min_reviewers') || false;

    const codeownerContent = await getCodeownerContent(octokit, context)
    .then((info) => {
      return info;
    });

    if (codeownerContent === 'NO CODEOWNERS FOUND' ) {
      return core.notice(codeownerContent);
    }

    const prNumber = context.payload.pull_request.number;

    // get files from the PR
    const prFileInfo = await octokit.rest.pulls.listFiles({
      ...context.repo,
      pull_number: prNumber,
    }).then((response) => {
      return response.data;
    });

    const prFilePaths = [];
    prFileInfo.forEach((file) => {
      prFilePaths.push(file.filename);
    });

    // get reviews on the PR
    const reviews = await octokit.rest.pulls.listReviews({
      ...context.repo,
      pull_number: prNumber,
    }).then((response) => {
      return response.data;
    });

    const currentReviews = []
    reviews.forEach((review) => {
      currentReviews.push({ reviewer: '@' + review.user.login, state: review.state });
    })

    // prepare codeowner content so codeowner files can be compared to the PR files
    const codeownerInfo = prepareCodeownerContent(codeownerContent, ignoreTeams, octokit);

    // set the required reviewers for the PR
    const requiredReviewers = setRequiredReviewers(codeownerInfo, prFilePaths);

    // compare codeowners to reviews on the PR
    const { completedReviews, startedReviews, needsReview, incompleteReviews } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );

    const reviewInfo = prepareReviewInfo(completedReviews, startedReviews, needsReview);

    // log codeowner reviews
    if (incompleteReviews) {
      core.info(reviewInfo.info);
      return core.setFailed(reviewInfo.error);
    }

    return core.notice(reviewInfo.success);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
