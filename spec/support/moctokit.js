class Moctokit {
  constructor() {
    this.rest = {
      pulls: {
        listCommits: this.listCommits,
        listFiles: this.listFiles,
        listReviews: this.listReviews
      },
      repos: {
        getContent: this.getContent
      },
      teams: {
        listMembersInOrg: this.listMembersInOrg
      }
    };
  }

  getContent() {
    return Promise.resolve({
      data: { download_url: 'https://some/mock/url/example.com' }
    });
  }

  listCommits() {
    return Promise.resolve({
      data: [
        { author: { login: 'committer1' } },
        { author: { login: 'committer2' } }
      ]
    })
  }

  listFiles() {
    return Promise.resolve({
      data: [
        { filename: 'pow/pop/woot.py' },
        { filename: 'some_other_directory/yip.js' }
      ]
    })
  }

  listReviews() {
    return Promise.resolve({
      data: [
        { user: { login: 'codeowner1' }, state: 'APPROVED' },
        { user: { login: 'codeowner2' }, state: 'COMMENT' }
      ]
    })
  }

  listMembersInOrg() {
    return Promise.resolve({
      data: [
        { login: 'codeowner7' },
        { login: 'codeowner8' }
      ]
    });
  }
}

module.exports = Moctokit
