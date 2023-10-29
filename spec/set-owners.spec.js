const setOwners = require('../src/set-owners.js');
const Moctokit = require('./support/moctokit.js');
const core = require('@actions/core');

describe("Set Owners", function() {
  let octokit = new Moctokit();
  let includeTeams = true;
  let committers = [ '@committer' ];

  it('sets owners', async function () {
    let contentOwners = [ '@codeowner1', '@codeowner2' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('sets owners with teams', async function() {
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2', '@codeowner7', '@codeowner8' ]);
  });

  it('makes a request to list members for a team', async function() {
    spyOn(octokit.rest.teams, 'listMembersInOrg').and.callThrough();
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);

    expect(octokit.rest.teams.listMembersInOrg).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team'
    });
  })

  it('continues without team members when team not found', async function() {
    spyOn(octokit.rest.teams, 'listMembersInOrg').and.callFake(function() {
      return Promise.reject(new Error('Not Found'));
    });
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('ignore teams when includeTeams is false', async function() {
    let includeTeams = false;
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('ignores email addresses', async function() {
    let contentOwners = [ '@codeowner1', '@codeowner2', 'dev@example.com' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2' ]);
  });

  it('removes duplicate codeowners', async function () {
    let contentOwners = [ '@codeowner1', '@codeowner1', '@codeowner2', '@codeowner7', '@org/team' ];
    let owners = await setOwners(contentOwners, committers, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner1', '@codeowner2', '@codeowner7', '@codeowner8' ]);
  });

  it('does NOT include PR committers in the list of codeowners', async function() {
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ];
    let codeownerCommitters = [ '@codeowner1', '@codeowner8' ]
    let owners = await setOwners(contentOwners, codeownerCommitters, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner2', '@codeowner7' ]);
  });

  it('does NOT include PR committers when includeTeams is false', async function() {
    let includeTeams = false;
    let contentOwners = [ '@codeowner1', '@codeowner2', '@org/team' ];
    let codeownerCommitters = [ '@codeowner1', '@codeowner8' ]
    let owners = await setOwners(contentOwners, codeownerCommitters, includeTeams, octokit);
    expect(owners).toEqual([ '@codeowner2' ]);
  });
});
