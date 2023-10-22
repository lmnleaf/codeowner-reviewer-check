const setRequiredReviewers = require("../src/set-required-reviewers.js");

describe("Set Required Reviewers", function() {
  let codeownerInfo = [];
  const prFiles = [ 
    'src/something.js',
    'woot/yip/wow.rb',
    'woot/tipsy/this-file.js',
    'hip/hep/hap/oh_my.rb',
    'src/topsy/turvy/tip/time.js',
    'src/pow/pop/pin.js',
    'src/boop/beep/bip/bam.js',
    'src/tim/tam/that-file.js',
    'pip/peep/something-else.js'
  ]

  it("adds required reviewers when there's a codeowner for everything", function() {
    codeownerInfo = [
      { patternType: 'everything', patternMatch: '*', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.md', owners: [ '@codeowner2' ] }
    ];
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([{ files: '*', requiredReviewers: [ '@codeowner1' ] }]);
  });

  it ("does NOT add a required reviewer when there aren't any matches", function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: '/no/match', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner2' ] }
    ];
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([]);
  });

  it('adds required reviewers for extensions', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: '/tap/tea', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.js', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ];
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles); 
    expect(reviewers).toEqual([{ files: '*.js', requiredReviewers: [ '@codeowner2', '@codeowner3' ] }]);
  });

  it('removes duplicate codeowners from the reviewers set', function(){
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'pow/pop/*', owners: [ '@codeowner1', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.js', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'directory', patternMatch: '/woot/yip', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([
      { files: 'pow/pop/*', requiredReviewers: [ '@codeowner1', '@codeowner3' ] },
      { files: '*.js', requiredReviewers: [ '@codeowner2', '@codeowner3' ] },
      { files: '/woot/yip', requiredReviewers: [ '@codeowner1' ] }
    ]);
  });

  it('adds reviewers for any file in a directory when the codeowner path starts at the root directory', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: '/woot/yip', owners: [ '@codeowner1' ] },
      { patternType: 'directory', patternMatch: 'cool/cat', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([{ files: '/woot/yip', requiredReviewers: [ '@codeowner1' ] }]);
  });

  it('adds required reviewers for specific files when the codeowner path starts at the root directory', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: '/topsy/turvy/', owners: [ '@codeowner1' ] },
      { patternType: 'directory', patternMatch: '/woot/tipsy/this-file.js', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([
      { files: '/woot/tipsy/this-file.js', requiredReviewers: [ '@codeowner2', '@codeowner3' ] }
    ]);
  });

  it('adds required reviewers for any files when the codeowner path starts at the root directory', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: '/topsy/turvy/', owners: [ '@codeowner1' ] },
      { patternType: 'directory', patternMatch: '/woot/tipsy/*', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([{ files: '/woot/tipsy/*', requiredReviewers: [ '@codeowner2', '@codeowner3' ] }]);
  });

  it('does NOT add required reviewers when the codeowner path is for files only but there is a sub directory', function(){
    codeownerInfo = [
      { patternType: 'directory', patternMatch: '/hip/hep/*', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([]);
  });

  it('adds required reviewers for directories when the codeowner path is located anywhere', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'topsy/turvy', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([{ files: 'topsy/turvy', requiredReviewers: [ '@codeowner1' ] }]);
  });

  it('adds required reviewers for specific files when the codeowner path starts anywhere', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'tim/tam/that-file.js', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([
      { files: 'tim/tam/that-file.js', requiredReviewers: [ '@codeowner2', '@codeowner3' ] }
    ]);
  });

  it('adds required reviewers for any files when the codeowner path starts anywhere', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'pow/pop/*', owners: [ '@codeowner1', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([
      { files: 'pow/pop/*', requiredReviewers: [ '@codeowner1', '@codeowner3' ] }
    ]);
  });

  it('does NOT add required reviewers when the codeowner path starts anywhere and is for files only but there is a sub directory', function(){
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'boop/beep/*', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([]);
  });

  it('adds required reviewers when multiple conditions are met', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'pow/pop/*', owners: [ '@codeowner1', '@codeowner3' ] },
      { patternType: 'extension', patternMatch: '*.js', owners: [ '@codeowner2', '@codeowner3' ] },
      { patternType: 'directory', patternMatch: '/woot/yip', owners: [ '@codeowner1' ] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4'] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([
      { files: 'pow/pop/*', requiredReviewers: [ '@codeowner1', '@codeowner3' ] },
      { files: '*.js', requiredReviewers: [ '@codeowner2', '@codeowner3' ] },
      { files: '/woot/yip', requiredReviewers: [ '@codeowner1' ] }
    ]);
  });

  it('sets owners to an empty array when codeowners are blank', function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'pip/peep', owners: [] },
      { patternType: 'extension', patternMatch: '*.py', owners: [ '@codeowner4' ] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([{ files: 'pip/peep', requiredReviewers: [] }]);
  });

  it("sets required reviewers to an empty array when there aren't any matching files", function() {
    codeownerInfo = [
      { patternType: 'directory', patternMatch: 'nothing/matches', owners: [ '@codeowner1' ] }
    ]
    let reviewers = setRequiredReviewers(codeownerInfo, prFiles);
    expect(reviewers).toEqual([]);
  });

  xit('tracks exceptions', function() {
  });
});
