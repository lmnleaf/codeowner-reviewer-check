function setRequiredReviewers(codeownerInfo, prFilePaths) {

  const requiredReviewers = [];

  codeownerInfo.forEach((detail) => {
    let patternType = detail.patternType;
    let patternMatch = detail.patternMatch;
    let owners = detail.owners;

    if (patternType === 'everything') {
      requiredReviewers.push({ files: patternMatch, requiredReviewers: owners });
    } else if (patternType === 'extension') {
      let prFileExtensions = prFilePaths.map((file) => '*.' + file.split('.').pop())
      if (prFileExtensions.includes(patternMatch)) {
        requiredReviewers.push({ files: patternMatch, requiredReviewers: owners });
      }
    } else if (patternType === 'directory') {
      let root = patternMatch.startsWith('/');
      let filesOnly = patternMatch.endsWith('*');
      let codeownersCode = patternMatch.replaceAll('*', '');

      prFilePaths.forEach((prFilePath) => {
        if (root) {
          let codePath = codeownersCode.slice(1);

          if (prFilePath.indexOf(codePath) === 0) {
            if (filesOnly) {
              // checks for additional directories
              if ((prFilePath.split('/').length - 1) === (codePath.split('/').length - 1)) {
                requiredReviewers.push({ files: patternMatch, requiredReviewers: owners });
              }
            } else {
              // add reviewers for any directories or specific files
              requiredReviewers.push({ files: patternMatch, requiredReviewers: owners });
            }
          }
        } else {
          if (prFilePath.includes(codeownersCode)) {
            if (filesOnly) {
              startIndex = prFilePath.indexOf(codeownersCode);
              endIndex = startIndex + codeownersCode.length;
              endOfPath = prFilePath.slice(endIndex);
      
              if (!endOfPath.includes('/')) {
                requiredReviewers.push({ files: patternMatch, requiredReviewers: owners });
              }
            } else {
              requiredReviewers.push({ files: patternMatch, requiredReviewers: owners });
            }
          }
        }
      });
    }
  });

  return requiredReviewers;
};

module.exports = setRequiredReviewers
