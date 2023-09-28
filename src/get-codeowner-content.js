async function getCodeownerContent(octokit, owner, repo) {
  try {
    // use octokit to get the CODEOWNERS URL
    const fileInfo = await octokit.rest.repos.getContent({
      owner: owner,
      repo: repo,
      path: ".github/CODEOWNERS"
    });

    let downloadURL = fileInfo.data.download_url;

    // get CODEOWNERS content
    const response = await fetch(downloadURL, {
      method: "GET",
      headers: {
        "Accept": "application/vnd.github+json",
      }
    });

    // read CODEOWNERS content
    const reader = response.body.getReader();
    let { value: contents, done: readerDone } = await reader.read();

    const utf8Decoder = new TextDecoder("utf-8");
    contents = contents ? utf8Decoder.decode(contents, { stream: true }) : "NO CONTENT";

    return contents;
  } catch(error) {
    if (error.message === "Not Found") {
      return 'NO CODEOWNERS FOUND';
    }
    throw error;
  }
}

module.exports = getCodeownerContent
