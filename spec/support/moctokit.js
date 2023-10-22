class Moctokit {
  constructor() {
    this.rest = {
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
