async function getCodeownerContent(octokit, context, core) {
  try {
    // use octokit to get the CODEOWNERS URL
    core.info('GET Repo Content');
    const fileInfo = await octokit.rest.repos.getContent({
      ...context.repo,
      path: ".github/CODEOWNERS"
    });

    let downloadURL = fileInfo.data.download_url;

    // get CODEOWNERS content
    core.info('GET CODEOWNERS Content');
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

    core.info('Codeowners Content: ', contents);

    return contents;
  } catch(error) {
    core.debug('Codeowner Content Error: ', error.message);
    if (error.message === "Not Found") {
      return 'NO CODEOWNERS FOUND';
    }
    throw error;
  }
}

module.exports = getCodeownerContent
