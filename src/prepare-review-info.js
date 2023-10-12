function prepareReviewInfo(completedReviews, startedReviews, needsReview) {
  let setReviewerInfo = (function(reviews) {
    let reviewerInfo = '';

    if (reviews.length > 0) {
      reviews.forEach((review) => {
        reviewerInfo += 'Files: ' + review.files + '; Codeowners: ' + review.codeowners.join(', ') + '\n';
      });
    } else {
      reviewerInfo = 'None\n';
    }

    return reviewerInfo;
  });

  let completed = '\u001b[48;2;74;153;69mCompleted Reviews: \n' + setReviewerInfo(completedReviews);
  let started = '\u001b[48;2;69;82;153mStarted Reviews: \n' + setReviewerInfo(startedReviews);
  let needed = '\u001b[48;2;191;25;25mNeeds Review: \n' + setReviewerInfo(needsReview);

  let reviewerOutput = {
    info: completed + '\n' + started + '\n' + needed,
    error: '\u001b[1mCodeowner reviews are needed. Please ask Codeowners to complete their reviews.',
    success: '\u001b[1mAll required Codeowner reviews have been completed. Thank you! \n'
  };

  return reviewerOutput;
}

module.exports = prepareReviewInfo
