async function setOwners(contentOwners, prCommitters, includeTeams, octokit) {
    // filter out email owners
    let nonEmailOwners = contentOwners.filter((owner) => 
      !owner.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    );

    let owners = nonEmailOwners.filter((owner) => !owner.includes('/'));

    let committers = new Set([...prCommitters]);

    if (!includeTeams) {
      owners = new Set([...owners].filter(o => !committers.has(o)));
      return [...owners];
    }

    // in the codeowner file, the teams format is `@org/team`
    let teams = nonEmailOwners.filter((owner) => owner.includes('/'));

    // get members for each team and add them to owners
    for (const team of teams) {
      let requestParams = team.split('/');
      const teamMembers = await octokit.rest.teams.listMembersInOrg({
        org: requestParams[0].substring(1),
        team_slug: requestParams[1]
      }).then((response) => {
        return response.data;
      }).catch((error) => {
        if (error.message === 'Not Found') {
          return [];
        } else {
          throw error;
        }
      });

      teamMembers.forEach((member) => owners.push('@' + member.login));
    }

  // filter out PR committers
  owners = new Set([...owners].filter(o => !committers.has(o)));
  return [...owners];
}

module.exports = setOwners
