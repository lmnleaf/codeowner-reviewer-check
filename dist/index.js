/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 359:
/***/ ((module) => {

module.exports = eval("require")("../src/compare-reviewers.js");


/***/ }),

/***/ 699:
/***/ ((module) => {

module.exports = eval("require")("../src/get-codeowner-content.js");


/***/ }),

/***/ 801:
/***/ ((module) => {

module.exports = eval("require")("../src/prepare-codeowner-content.js");


/***/ }),

/***/ 991:
/***/ ((module) => {

module.exports = eval("require")("../src/set-required-reviewers.js");


/***/ }),

/***/ 650:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 9:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(650);
const github = __nccwpck_require__(9);
const getCodeownerContent = __nccwpck_require__(699);
const prepareCodeownerContent = __nccwpck_require__(801);
const setRequiredReviewers = __nccwpck_require__(991);
const compareReviewers = __nccwpck_require__(359);

const context = github.context;

async function main() {
  try {
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.getOctokit(token);

    const minReviewers = core.getInput('min_reviewers');

    const codeownerContent = await getCodeownerContent(octokit, owner, repo)
    .then((info) => {
      return info;
    });

    if (codeownerContent === "NO CODEOWNERS FOUND" ) {
      return core.info(codeownerContent);
    }

    const prNumber = context.payload.pull_request.number;

    // get files from the PR
    const prFileInfo = await octokit.rest.pulls.listFiles({
      ...context.repo,
      pull_number: prNumber,
    }).then((response) => {
      return response.data;
    });

    const prFilePaths = [];
    prFileInfo.forEach((file) => {
      prFilePaths.push(file.filename);
    });

    // get reviews on the PR
    const reviews = await octokit.rest.pulls.listReviews({
      ...context.repo,
      pull_number: prNumber,
    }).then((response) => {
      return response.data;
    });

    const currentReviews = []
    reviews.forEach((review) => {
      currentReviews.push({ reviewer: '@' + review.user.login, state: review.state });
    })

    // prepare codeowner content so codeowner files can be compared to the PR files
    const codeownerInfo = prepareCodeownerContent(codeownerContent);

    // set the required reviewers for the PR
    const requiredReviewers = setRequiredReviewers(codeownerInfo, prFilePaths);

    // compare codeowners to reviews on the PR
    const { completedReviews, startedReviews, needsReview } = compareReviewers(
      currentReviews,
      requiredReviewers,
      minReviewers
    );

    let completedOutput = completedReviews.length > 0 ? JSON.stringify(completedReviews) : "None";
    let startedOutput = startedReviews.length > 0 ? JSON.stringify(startedReviews) : "None";
    let needsReviewOutput = needsReview.length > 0 ? JSON>stringify(startedReviews) : "None";

    let output = `Completed Reviews: ` + completedOutput + `\n
      Started Reviews: ` + startedOutput + `\n
      Needs Review: ` + needsReviewOutput

    if (needsReview.length > 0) {
      return core.setFailed(output);
    }

    core.info(ouput);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

})();

module.exports = __webpack_exports__;
/******/ })()
;