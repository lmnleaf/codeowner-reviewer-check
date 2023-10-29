const codeownerReviewerCheck = require("../src/codeowner-reviewer-check.js");
const Moctokit = require('./support/moctokit.js');
const { Readable } = require('stream');

describe("Codeowner Reviewer Check", function() {
  let octokit = new Moctokit();
  let context = {
    payload: { pull_request: { number: 1 } },
    repo: 'repo-name'
  };
  let minReviewers = 2;
  let includeTeams = true;

  let codeowners = `# Codeowners
  pow/pop/* @codeowner1
  *.js @codeowner2 @org/team
  /woot/yip @codeowner2 @codeowner3 @codeowner4`;

  let completed = '\u001b[48;2;74;153;69mCompleted Reviews: \n' +
    'Files: pow/pop/*; Codeowners: @codeowner1\n';
  let started = '\u001b[48;2;69;82;153mStarted Reviews: \n' +
    'Files: *.js; Codeowners: @codeowner2\n';
  let needed = '\u001b[48;2;191;25;25mNeeds Review: \n' +
    'Files: *.js; Codeowners: @codeowner7, @codeowner8\n';
  let reviewInfo = {
    info: completed + '\n' + started + '\n' + needed,
    error: '\u001b[1mCodeowner reviews are needed. Please ask Codeowners to complete their reviews.',
    success: '\u001b[1mAll required Codeowner reviews have been completed. Thank you! \n'
  };

  it('checks codeowner reviewers', async function() {
    let mockBody = new Readable();
    mockBody.push(codeowners);
    mockBody.push(null);
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.resolve(new Response(mockBody, {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });

    let reviewerCheck = await codeownerReviewerCheck(octokit, context, minReviewers, includeTeams);

    expect(reviewerCheck.reviewsNeeded).toEqual(true);
    expect(reviewerCheck.reviewInfo).toEqual(reviewInfo);
  });

  it('returns reviewer info when no CODEOWNERS file is found', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('Not Found'));
    });

    let reviewInfo = { info: null, error: null, success: 'NO CODEOWNERS FOUND' }
    let reviewerCheck = await codeownerReviewerCheck(octokit, context, minReviewers, includeTeams);

    expect(reviewerCheck.reviewsNeeded).toEqual(false);
    expect(reviewerCheck.reviewInfo).toEqual(reviewInfo);
  })

  it('defaults to 2 reviewers when minReviewers is set to less than 2', async function() {
    let minReviewers = 1;

    let mockBody = new Readable();
    mockBody.push(codeowners);
    mockBody.push(null);
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.resolve(new Response(mockBody, {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });

    let reviewerCheck = await codeownerReviewerCheck(octokit, context, minReviewers, includeTeams);

    expect(reviewerCheck.reviewsNeeded).toEqual(true);
    expect(reviewerCheck.reviewInfo).toEqual(reviewInfo);
  });

  it('ignores teams when includeTeams is false', async function() {
    let includeTeams = false;

    let mockBody = new Readable();
    mockBody.push(codeowners);
    mockBody.push(null);
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.resolve(new Response(mockBody, {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });

    let reviewInfo = {
      info: completed + '\n' + started + '\n' +  '\u001b[48;2;191;25;25mNeeds Review: \n' + 'None\n',
      error: '\u001b[1mCodeowner reviews are needed. Please ask Codeowners to complete their reviews.',
      success: '\u001b[1mAll required Codeowner reviews have been completed. Thank you! \n'
    };
    let reviewerCheck = await codeownerReviewerCheck(octokit, context, minReviewers, includeTeams);

    expect(reviewerCheck.reviewsNeeded).toEqual(true);
    expect(reviewerCheck.reviewInfo).toEqual(reviewInfo);
  });

  it('handles errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('fetch error'));
    });

    try {
      let reviewerCheck = await codeownerReviewerCheck(octokit, context, minReviewers, includeTeams);
    } catch (error) {
      expect(error).toEqual(new Error('fetch error'));
    }
  })
});
