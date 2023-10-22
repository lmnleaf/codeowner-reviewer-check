const prepareCodeownerContent = require("../src/prepare-codeowner-content.js");
const setOwners = require('../src/set-owners.js');
const Moctokit = require('./support/moctokit.js');

describe("Prepare Codeowner Content", function() {
  let octokit = new Moctokit();

  const content = `# Codeowners
    * @codeowner1 @codeowner2
    # here are some comments
    /woot/yip @codeowner3 @codeowner4

    wow/ @codeowner1 @org/team

    *.js @codeowner5

    *.py @codeowner4
    `

  const codeownerInfo = [
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
      owners: [ '@codeowner1', '@codeowner7', '@codeowner8' ]
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
    },
  ];

  it('preps codeowner content for comparision to PR files', async function() {
    let ignoreTeams = false;
    let preparedContent = await prepareCodeownerContent(content, ignoreTeams, octokit);
    expect(preparedContent).toEqual(codeownerInfo);
  });

  it('preps codeowner content when ignoreTeams is true', async function() {
    let ignoreTeams = true;
    let noTeamsInfo = codeownerInfo.map(info => {
      if(info.patternMatch === 'wow/') {
        return {
          patternType: 'directory',
          patternMatch: 'wow/',
          owners: [ '@codeowner1' ]
        };
      } else {
        return info;
      }
    });
    let preparedContent = await prepareCodeownerContent(content, ignoreTeams, octokit);
    expect(preparedContent).toEqual(noTeamsInfo);
  });
});
