const prepareCodeownerContent = require("../src/prepare-codeowner-content.js");

describe("Prepare Codeowner Content", function() {
  let content = `# Codeowners
    * @codeowner1 @codeowner2
    # here are some comments
    /woot/yip @codeowner3 @codeowner4

    wow/ @codeowner1

    *.js @codeowner5

    *.py @codeowner4
    `

  let codeownerInfo = [
    {
      patternType: 'everything',
      patternMatch: '*',
      owners: [ '@codeowner1', '@codeowner2' ]
    },
    {
      patternType: 'directory',
      patternMatch: '/woot/yip',
      owners: [ '@codeowner3', '@codeowner4' ]
    },
    {
      patternType: 'directory',
      patternMatch: 'wow/',
      owners: [ '@codeowner1' ]
    },
    {
      patternType: 'extension',
      patternMatch: '*.js',
      owners: [ '@codeowner5' ]
    },
    {
      patternType: 'extension',
      patternMatch: '*.py',
      owners: [ '@codeowner4' ]
    }
  ];

  it('preps codeowner content for comparision to PR files', function() {
    let preparedContent = prepareCodeownerContent(content);
    expect(preparedContent).toEqual(codeownerInfo);
  });
});
