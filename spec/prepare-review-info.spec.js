const prepareReviewInfo = require("../src/prepare-review-info.js");

describe("Prepare Review Info", function() {
  const reviews = [
    { files: 'pow/pop/*', codeowners: [ '@codeowner1', '@codeowner3' ] },
    { files: '*.js', codeowners: [ '@codeowner2', '@codeowner3' ] },
    { files: '/woot/yip', codeowners: ['@codeowner1'] }
  ]
  const minReviewers = 2;

  it('returns review info as a string', function() {
    let info = prepareReviewInfo(reviews);
    let expectedInfo = 'Files: pow/pop/*; Codeowners: @codeowner1, @codeowner3\n' +
      'Files: *.js; Codeowners: @codeowner2, @codeowner3\n' +
      'Files: /woot/yip; Codeowners: @codeowner1\n'
    expect(info).toEqual(expectedInfo);
  });

  it("returns 'None' when there isn't any review info", function() {
    let info = prepareReviewInfo([]);
    expect(info).toEqual('None\n');
  })
})
