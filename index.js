const core = require('@actions/core');
const github = require('@actions/github');

const context = github.context;

async function main() {
  try {
    // do some things
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
