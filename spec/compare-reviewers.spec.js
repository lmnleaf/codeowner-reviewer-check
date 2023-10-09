const compareReviewers = require("../src/compare-reviewers.js");

describe("Compare Reviewers", function() {
  const requiredReviewers = [
    { files: 'pow/pop/*', requiredReviewers: [ '@codeowner1', '@codeowner3' ] },
    { files: '*.js', requiredReviewers: [ '@codeowner2', '@codeowner3', '@codeowner5', '@codeowner6' ] },
    { files: '/woot/yip', requiredReviewers: [ '@codeowner1' ] }
  ]
  const minReviewers = 2;

  it('returns reviews that have been completed by codeowners', function() {
    let currentReviews = [
      { reviewer: '@codeowner1', state: 'APPROVED' },
      { reviewer: '@codeowner2', state: 'APPROVED' },
      { reviewer: '@codeowner3', state: 'APPROVED' }
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner1', '@codeowner3' ] },
      { files: '*.js', codeowners: [ '@codeowner2', '@codeowner3' ] },
      { files: '/woot/yip', codeowners: ['@codeowner1'] }
    ]);
    expect(startedReviews).toEqual([]);
    expect(needsReview).toEqual([]);
  });

  it('returns reviews that have been started by codeowners', function() {
    let currentReviews = [
      { reviewer: '@codeowner1', state: 'COMMENT' },,
      { reviewer: '@codeowner3', state: 'COMMENT' },
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([]);
    expect(startedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner1', '@codeowner3' ] },
      { files: '*.js', codeowners: [ '@codeowner3' ] },
      { files: '/woot/yip', codeowners: [ '@codeowner1' ] }
    ]);
    expect(needsReview).toEqual([
      { files: '*.js', codeowners: [ '@codeowner2', '@codeowner5', '@codeowner6' ] }
    ]);
  });

  it('returns needed reviews and does not list reviews by non-codeowners', function() {
    let currentReviews = [
      { reviewer: '@codeowner4', state: 'CHANGES REQUESTED' }
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([]);
    expect(startedReviews).toEqual([]);
    expect(needsReview).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner1', '@codeowner3' ] },
      { files: '*.js', codeowners: [ '@codeowner2', '@codeowner3', '@codeowner5', '@codeowner6' ] },
      { files: '/woot/yip', codeowners: [ '@codeowner1' ] }
    ]);
  });

  it('does not return needed reviews when the min number of reviews have been completed', function() {
    let currentReviews = [
      { reviewer: '@codeowner2', state: 'APPROVED' },
      { reviewer: '@codeowner3', state: 'APPROVED' },
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner3' ] },
      { files: '*.js', codeowners: [ '@codeowner2', '@codeowner3' ] }
    ]);
    expect(startedReviews).toEqual([]);
    expect(needsReview).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner1' ] },
      { files: '/woot/yip', codeowners: [ '@codeowner1' ] }
    ]);
  });

  it('returns needed reviews when there are started reviews but not enough approved reviews', function() {
    let currentReviews = [
      { reviewer: '@codeowner2', state: 'APPROVED' },
      { reviewer: '@codeowner3', state: 'COMMENT' }
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([
      { files: '*.js', codeowners: [ '@codeowner2' ] }
    ]);
    expect(startedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner3' ] },
      { files: '*.js', codeowners: [ '@codeowner3' ] }
    ]);
    expect(needsReview).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner1' ] },
      { files: '*.js', codeowners: [ '@codeowner5', '@codeowner6' ]},
      { files: '/woot/yip', codeowners: [ '@codeowner1' ] }
    ]);
  });

  it("returns only needed reviews when there aren't any reviews on the PR", function() {
    let currentReviews = []
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([]);
    expect(startedReviews).toEqual([])
    expect(needsReview).toEqual([
      { files: 'pow/pop/*', codeowners: ['@codeowner1', '@codeowner3'] },
      { files: '*.js', codeowners: ['@codeowner2', '@codeowner3', '@codeowner5', '@codeowner6'] },
      { files: '/woot/yip', codeowners: ['@codeowner1'] }
    ]);
  });
  
  it('returns a combination of reviews', function() {
    let currentReviews = [
      { reviewer: '@codeowner1', state: 'COMMENT' },
      { reviewer: '@codeowner2', state: 'APPROVED' },
      { reviewer: '@codeowner3', state: 'APPROVED' },
      { reviewer: '@codeowner4', state: 'CHANGES REQUESTED' }
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner3' ] },
      { files: '*.js', codeowners: [ '@codeowner2', '@codeowner3' ] }
    ]);
    expect(startedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: [ '@codeowner1' ] },
      { files: '/woot/yip', codeowners: [ '@codeowner1' ] }
    ]);
    expect(needsReview).toEqual([]);
  });

  it('requires at least the minimum approved reviews unless total codeowners are fewer than the minumum', function() {
    let currentReviews = [
      { reviewer: '@codeowner1', state: 'APPROVED' }
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );
    expect(completedReviews).toEqual([
      { files: 'pow/pop/*', codeowners: ['@codeowner1'] },
      { files: '/woot/yip', codeowners: ['@codeowner1'] }
    ]);
    expect(startedReviews).toEqual([])
    expect(needsReview).toEqual([
      { files: 'pow/pop/*', codeowners: ['@codeowner3'] },
      { files: '*.js', codeowners: ['@codeowner2', '@codeowner3', '@codeowner5', '@codeowner6'] }
    ]);
  });

  it("does NOT require reviews when their aren't any codeowners", function() {
    let noRequiredReviewers = [
      { files: '/woot/yip', requiredReviewers: [] }
    ]
    let currentReviews = [
      { reviewer: '@codeowner1', state: 'APPROVED' }
    ]
    let { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      noRequiredReviewers,
      minReviewers
    )
    expect(completedReviews).toEqual([]);
    expect(startedReviews).toEqual([]);
    expect(needsReview).toEqual([]);
  });
});
