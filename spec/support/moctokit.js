class Moctokit {
  constructor() {
    this.rest = {
      repos: {
        getContent: this.getContent
      }
    };
  }

  getContent() {
    return Promise.resolve({
      data: { download_url: 'https://some/mock/url/example.com' }
    });
  }
}

module.exports = Moctokit
