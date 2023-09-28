function prepareCodeownerContent(content) {
  // remove comments from CODEOWNERS content
  let filteredLines = content.split(/\s*$\s*/m)
    .filter((line) => !line.startsWith('#') && line !== '');

  // parse CODEOWNERS content
  let codeownerInfo = []

  filteredLines.forEach((line) => {
    // split the codeowners line on the first space
    let [first, ...owners] = line.split(/\s+/);

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
  });

  return codeownerInfo;
}

module.exports = prepareCodeownerContent
