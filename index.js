const core = require('@actions/core');
const github = require('@actions/github');

const context = github.context;

async function main() {
  try {
    if (github.context.eventName === 'pull_request') {
      return core.setFailed('Waiting for Reviews');
    };

    const token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.getOctokit(token);
    const minReviewers = core.getInput('min_reviewers');

    const codeownerContent = await getCodeownerContent(octokit, owner, repo)
    .then((info) => {
      return info;
    });

    if (codeownerContent === "NO CODEOWNERS FOUND" ) {
      return [];
    }

    // get files from the PR
    const prFileInfo = await octokit.rest.pulls.listFiles({
      owner: owner,
      repo: repo,
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
      owner: owner,
      repo: repo,
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

    let completedOutput = completedReviews.length > 0 ? JSON.stringify(completedReviews) : "None";
    let startedOutput = startedReviews.length > 0 ? JSON.stringify(startedReviews) : "None";
    let needsReviewOutput = needsReview.length > 0 ? JSON>stringify(startedReviews) : "None";

    let output = `Completed Reviews: ` + completedOutput + `\n
      Started Reviews: ` + startedOutput + `\n
      Needs Review: ` + needsReviewOutput

    if (needsReview.length > 0) {
      return core.setFailed(output);
    }

    core.info(ouput);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
