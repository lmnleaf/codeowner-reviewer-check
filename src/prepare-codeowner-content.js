const setOwners = require('./set-owners.js');

async function prepareCodeownerContent(content, ignoreTeams, octokit) {
  // remove comments from CODEOWNERS content
  let filteredLines = content.split(/\s*$\s*/m)
    .filter((line) => !line.startsWith('#') && line !== '');

  // parse CODEOWNERS content
  let codeownerInfo = [];
  for (const line of filteredLines) {
    // split the codeowners line on the first space
    let [first, ...last] = line.split(/\s+/);
    const owners = await setOwners(last, ignoreTeams, octokit)
    .then((info) => {
      return info;
    }).catch((error) => {
      throw error;
    });

    let pattern = '';
    let patternMatch = '';
    let files = {};

    if (first === '*') {
      pattern = 'everything';
      patternMatch = '*';
    } else if (first.slice(0,2) === '*.') {
      pattern = 'extension';
      patternMatch = first;
    } else {
      pattern = 'directory'
      patternMatch = first;
    }

    codeownerInfo.push({ 
      patternType: pattern, 
      patternMatch: patternMatch, 
      owners: owners
    });
  }

  return codeownerInfo;
}

module.exports = prepareCodeownerContent
