function prepareReviewInfo(reviews) {
  let reviewerInfo = '';

  if (reviews.length > 0) {
    reviews.forEach((review) => {
      reviewerInfo += 'Files: ' + review.files + '; Codeowners: ' + review.codeowners.join(', ') + '\n';
    });
  } else {
    reviewerInfo = 'None\n';
  }

  return reviewerInfo;
}

module.exports = prepareReviewInfo
