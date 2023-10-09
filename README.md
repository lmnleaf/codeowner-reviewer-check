# codeowner-reviewer-check

The Codeowner Reviewer Check Action supplements GitHub's `Require review from Code Owners` branch protection and repo rule set protections for PRs.  

Details:
* Currently, with GitHub branch protections or repo rule sets, when code owner reviews are required, only one code owner per set of files is required to review the pull request.
* This Action can be used to ensure that a minimum number of code owners has reviewed the pull request before it is merged.
  * Required code owners will be pulled from the `CODEOWNERS` file in the default branch of the repository.
  * The workflow will fail until the minimum number of code owner reviews have been completed.
    * The workflow logs will list completed, started, and needed code owner reviews.
  * The minimum number of required code owner reviews can be set. It will default to 2 when it is not set or set to a number smaller than 2.

Limitations:
* This Action will not take exceptions to code owner requirements into account. If some files in a subdirectory are excepted from code owner review in your `CODEOWNERS` file, this action will ignore the exceptions and require review.
* This Action does not assign code owner reviewers to a PR.
* To use this Action as a required status check, as long as code owner reviews are required as part of the branch protections or repo rule sets on the repo, then the workflow can be triggered on `pull_request_review` since it will fail after the first PR review and will not pass the check until the minimum number of code owner reviews have been completed.

Sample Output for Successful Check:
```
All required Codeowner reviews have been completed. Thank you!
Completed Reviews: 
Files: *; Codeowners: @codeowner1, @codeowner2
Files: *.js; Codeowners: @codeowner3, @codeowner4
Files: /some/files; Codeowners: @codeowner2, @codeowner5

Started Reviews: 
None

Needs Review: 
None
```

Sample Output for Failing Check:
```
Completed Reviews: 
None

Started Reviews:
Files: *; Codeowners: @codeowner1, @codeowner2
Files: /some/files; Codeowners: @codeowner2, @codeowner5

Error: Please request Codeowner reviews. 
Needs Review: 
Files: *.js; Codeowners: @codeowner3, @codeowner4
```

Workflow setup:

```
name: Repo Activity

on: 
  pull_request:
  pull_request_review:

jobs:
  check_codeowner_reviews:
    runs-on: ubuntu-latest
    name: Codeowner Reviews
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Check Reviews
        uses: lmnleaf/codeowner-reviewer-check
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          min_reviewers: 3
```

Recommendation: Set branch protections/repo rules that require code owner review and run this workflow on `pull_request_review`.
