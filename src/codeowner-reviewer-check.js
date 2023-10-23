const getCodeownerContent = require('./get-codeowner-content.js');
const prepareCodeownerContent = require('./prepare-codeowner-content.js');
const setRequiredReviewers = require('./set-required-reviewers.js');
const compareReviewers = require('./compare-reviewers.js');
const prepareReviewInfo = require('./prepare-review-info.js');

async function codeownerReviewerCheck(octokit, context, minReviewers, ignoreTeams) {
  try {
    const codeownerContent = await getCodeownerContent(octokit, context)
    .then((info) => {
      return info;
    });

    if (codeownerContent === 'NO CODEOWNERS FOUND' ) {
      return { 
        reviewsNeeded: false,
        reviewInfo: { info: null, error: null, success: 'NO CODEOWNERS FOUND' } 
      }
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
    const codeownerInfo = await prepareCodeownerContent(codeownerContent, ignoreTeams, octokit);

    // set the required reviewers for the PR
    const requiredReviewers = setRequiredReviewers(codeownerInfo, prFilePaths);

    // compare codeowners to reviews on the PR
    const { completedReviews, startedReviews, needsReview, incompleteReviews } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );

    const reviewInfo = prepareReviewInfo(completedReviews, startedReviews, needsReview);

    let results = { reviewsNeeded: incompleteReviews, reviewInfo: reviewInfo };

    return results;
  } catch(error) {
    throw error;
  }
}

module.exports = codeownerReviewerCheck
