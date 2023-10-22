const setOwners = require('../src/set-owners.js');
const Moctokit = require('./support/moctokit.js');

describe("Prepare Codeowner Content", function() {
  let octokit = new Moctokit();
  let ignoreTeams = false;

  it('sets owners', async function () {
    let contentOwners = [ '@codeowner1', '@codeowner2' ]
    let owners = await setOwners(contentOwners, ignoreTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('sets owners with teams', async function() {
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ]
    let owners = await setOwners(contentOwners, ignoreTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2', '@codeowner7', '@codeowner8' ]);
  });

  it('ignores teams when ignoreTeams is true', async function() {
    let ignoreTeams = true;
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ]
    let owners = await setOwners(contentOwners, ignoreTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('ignores email addresses', async function() {
    let contentOwners = [ '@codeowner1', '@codeowner2', 'dev@example.com' ]
    let owners = await setOwners(contentOwners, ignoreTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('removes duplicate codeowners', async function () {
    let contentOwners = [ '@codeowner1', '@codeowner1', '@codeowner2', '@codeowner7', '@org/team' ]
    let owners = await setOwners(contentOwners, ignoreTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2', '@codeowner7', '@codeowner8' ]);
  });
});
