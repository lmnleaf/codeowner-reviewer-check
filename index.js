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

    const codeownerContent = await getCodeownerContent(octokit, context)
    .then((info) => {
      return info;
    });

    if (codeownerContent === 'NO CODEOWNERS FOUND' ) {
      return core.info(codeownerContent);
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
    const codeownerInfo = prepareCodeownerContent(codeownerContent);

    // set the required reviewers for the PR
    const requiredReviewers = setRequiredReviewers(codeownerInfo, prFilePaths);

    // compare codeowners to reviews on the PR
    const { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );

    // log codeowner reviews
    let completed = '\u001b[48;2;74;153;69mCompleted Reviews: \n' + prepareReviewInfo(completedReviews);
    let started = '\u001b[48;2;69;82;153mStarted Reviews: \n' + prepareReviewInfo(startedReviews);
    let needed = '\u001b[48;2;191;25;25mNeeds Review: \n' + prepareReviewInfo(needsReview);

    if (needsReview.length > 0) {
      core.info(completed + '\n' + started);
      return core.setFailed('\u001b[1mPlease request Codeowner reviews. \n' + needed);
    }

    core.notice(
      '\u001b[1mBoldAll required Codeowner reviews have been completed. Thank you! \n' +
      completed + '\n' +
      started + '\n' +
      needed
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
