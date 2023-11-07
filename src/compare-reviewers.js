function compareReviewers(currentReviews, requiredReviewers, minReviewers) {
  const approvals = [];
  const started = [];

  currentReviews.forEach((review) => {
    if (review.state === 'APPROVED') {
      approvals.push(review.reviewer);
    } else {
      started.push(review.reviewer);
    }
  });

  const completedReviews = [];
  const startedReviews = [];
  const needsReview = [];

  // create Sets for easier comparison
  let approvalsSet = new Set(approvals);
  let startedSet = new Set(started);

  // track incomplete reviews
  let incompleteFileReviews = [];

  requiredReviewers.forEach((reviewers) => {
    // Set of required reviews (files that require code owner review and the codeowners)
    // Example requiredSet: [ '@codeowner1', '@codeowner2', '@codeowner3', '@codeowner4' ]
    let requiredSet = new Set(reviewers.requiredReviewers);

    // Set of codeowners that approved the PR
    let approvalIntersection = new Set([...approvalsSet].filter(r => requiredSet.has(r)));

    // Set of codeowners that have started a review on the PR but have not approved it
    let startedIntersection = new Set([...startedSet]
      .filter(r => requiredSet.has(r))
      .filter(r => !approvalIntersection.has(r))
    );

    // min reviewers for the files
    let min = minReviewers;
    if (requiredSet.size < min) {
      min = requiredSet.size
    }

    if (approvalIntersection.size > 0) {
      completedReviews.push({ files: reviewers.files, codeowners: [...approvalIntersection] });
    }

    // if the number of codeowner approvals is less than the min number of codeowner reviews required
    // for the files, then track the incomplete file reviews by adding true to incompleteFileReviews.
    if (approvalIntersection.size < min) {
      incompleteFileReviews.push(true);
    }

    if (startedIntersection.size > 0) {
      startedReviews.push({ files: reviewers.files, codeowners: [...startedIntersection] });
    }

    let notStarted = []

    // Reviews are needed when the minimum number of required codeowner reviews have NOT been completed
    // Notes:
    // - if the total number of codeowners for the files is the same as the number of codeowners who have 
    // completed AND started reviews, then the files will not be added to needsReview.
    // - if there are more total codeowners on the files than the number of codeowners who have
    // completed AND started reviews, then the files will be added to needsReview. Reasoning: If the codeowner
    // who started a review, doesn't get around to completing it, the PR author will have a list of other 
    // codeowners who could review the PR AND until the required number of codeowners has approved the PR,
    // the PR is still in need of review.
    requiredSet.forEach((required) => {
      if (
          approvalIntersection.size < min && 
          !approvalIntersection.has(required) && 
          !startedIntersection.has(required)
         ) {
        notStarted.push(required);
      }
    })

    if (notStarted.length > 0) {
      needsReview.push({ files: reviewers.files, codeowners: [...notStarted] });
    }  
  });

  // if there are any files that still need codeowner review, then incompleteReviews is set to true.
  // Note: Codeowners may have started reviews, but not enough codeowner reviews have been completed to
  // meet the minimum number of reviews required for all the various files.
  let incompleteReviews = true;

  if (incompleteFileReviews.length === 0) {
    incompleteReviews = false;
  }

  return { completedReviews, startedReviews, needsReview, incompleteReviews };
};

module.exports = compareReviewers


