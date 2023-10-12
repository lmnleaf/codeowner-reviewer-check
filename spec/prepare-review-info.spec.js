const prepareReviewInfo = require("../src/prepare-review-info.js");

describe("Prepare Review Info", function() {
  let completedReviews = [
    { files: '*.js', codeowners: [ '@codeowner2' ] }
  ]
  let startedReviews = [
    { files: 'pow/pop/*', codeowners: [ '@codeowner1', '@codeowner3' ] },
    { files: '/woot/yip', codeowners: [ '@codeowner1' ] }
  ]
  let needsReview = [
    { files: '*.js', codeowners: [ '@codeowner5', '@codeowner6' ]},
  ]

  it('returns review info', function() {
    let output = prepareReviewInfo(completedReviews, startedReviews, needsReview);

    let completed = '\u001b[48;2;74;153;69mCompleted Reviews: \n' +
      'Files: *.js; Codeowners: @codeowner2\n'
    let started = '\u001b[48;2;69;82;153mStarted Reviews: \n' +
      'Files: pow/pop/*; Codeowners: @codeowner1, @codeowner3\n' +
      'Files: /woot/yip; Codeowners: @codeowner1\n'
    let needed = '\u001b[48;2;191;25;25mNeeds Review: \n' +
      'Files: *.js; Codeowners: @codeowner5, @codeowner6\n'

    let expectedOutput = {
      info: completed + '\n' + started + '\n' + needed,
      error: '\u001b[1mCodeowner reviews are needed. Please ask Codeowners to complete their reviews.',
      success: '\u001b[1mAll required Codeowner reviews have been completed. Thank you! \n'
    }

    expect(output).toEqual(expectedOutput);
  });

  it("returns 'None' when there isn't any review info", function() {
    let startedReviews = []
    let needsReview = []

    let output = prepareReviewInfo(completedReviews, startedReviews, needsReview);

    let completed = '\u001b[48;2;74;153;69mCompleted Reviews: \n' +
      'Files: *.js; Codeowners: @codeowner2\n'
    let started = '\u001b[48;2;69;82;153mStarted Reviews: \nNone\n'
    let needed = '\u001b[48;2;191;25;25mNeeds Review: \nNone\n'

    let expectedOutput = {
      info: completed + '\n' + started + '\n' + needed,
      error: '\u001b[1mCodeowner reviews are needed. Please ask Codeowners to complete their reviews.',
      success: '\u001b[1mAll required Codeowner reviews have been completed. Thank you! \n'
    }

    expect(output).toEqual(expectedOutput);
  });
})
