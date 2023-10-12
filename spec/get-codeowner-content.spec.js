const getCodeownerContent = require("../src/get-codeowner-content.js");
const Moctokit = require('./support/moctokit.js')
const { Readable } = require('stream');

describe('Get Codeowner Content', function() {
  let octokit = new Moctokit();
  let context = { repo: 'repo-name' };
  let downloadURL = 'https://some/mock/url/example.com';

  it('gets and processes the Codeowner file in the repo', async function() {
    const mockBody = new Readable();
    let codeowners = `# Codeowners
    pow/pop/* @codeowner1 @codeowner3
    *.js @codeowner2 @codeowner3
    /woot/yip @codeowner1`
    mockBody.push(codeowners);
    mockBody.push(null);  // indicates end-of-file, i.e., the end of the stream

    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.resolve(new Response(mockBody, {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });

    let codeownerContent = await getCodeownerContent(octokit, context);

    expect(globalThis.fetch).toHaveBeenCalledWith(downloadURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
      }
    });
    expect(codeownerContent).toContain('# Codeowners');
    expect(codeownerContent).toContain('pow/pop/* @codeowner1 @codeowner3');
    expect(codeownerContent).toContain('*.js @codeowner2 @codeowner3');
    expect(codeownerContent).toContain('/woot/yip @codeowner1');
  });

  it('handles fetch errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('fetch error'));
    });

    try {
      let codeownerContent = await getCodeownerContent(octokit, context);
    } catch (error) {
      expect(error).toEqual(new Error('fetch error'));
    }
  });

  it('handles `Not Found` fetch errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('Not Found'));
    });

    try {
      let codeownerContent = await getCodeownerContent(octokit, context);
    } catch (error) {
      expect(error).toEqual(new Error('NO CODEOWNERS FOUND'));
    }
  });
});
