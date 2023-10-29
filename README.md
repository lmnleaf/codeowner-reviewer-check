# codeowner-reviewer-check

The Codeowner Reviewer Check Action supplements GitHub's `Require review from Code Owners` branch protection and repo rule set protections for PRs.  

Overview:
* Currently, with GitHub branch protections or repo rule sets, when code owner reviews are required, only one code owner per set of files is required to review the pull request.
* This Action can be used to ensure that a minimum number of code owners has reviewed the pull request before it is merged.
  * Required code owners will be pulled from the `CODEOWNERS` file in the default branch of the repository.
  * The workflow will fail until the minimum number of code owner reviews have been completed.
  * The workflow logs will list completed, started, and needed code owner reviews.
  * The minimum number of required code owner reviews can be set. It will default to 2 when it is not set or set to a number smaller than 2.
  * Team codeowners are ignored by default. To include team codeowners, set `include_teams` to `true` AND set `TOKEN` to a personal access token (PAT). A PAT is required when including teams because the GITHUB_TOKEN does not have access to individual team members for comparison to PR reviewers.

Limitations:
* This Action ingores exceptions to code owner requirements. If some files in a subdirectory are excepted from code owner review in the `CODEOWNERS` file, this action will not take the exceptions into account and will require review.
* This Action ignores code owners identified by email.
* This Action converts teams to individual code owners. For example, if the `CODEOWNERS` file assignes code to `@org/team`, and `@codeowner1` and `@codeowner2` are the `@org/team` members, then the output will show that `@codeowner1` and `@codeowner2` need to review the PR. If teams are very large, this can be combersome.
* This Action does not assign code owner reviewers to a PR.
* To use this Action as a required status check, as long as code owner reviews are required as part of the branch protections or repo rule sets on the repo, then the workflow can be triggered on `pull_request_review` since it will fail after the first PR review and will not pass the check until the minimum number of code owner reviews have been completed.

Details:
* Required input for the workflow:
  * `TOKEN` - GITHUB_TOKEN or PAT.
  * `min_reviewers` - minimum number of codeowner reviewers required per any set of codeowner files; set to 2 or greater (will default to 2, if set to value less than 2)
* Optional input:
  * `include_teams` - defaults to `false`. Set to `true` to include teams AND set `TOKEN` to a PAT.
* Workflow will succeed with notice when a CODEOWNERS file is not found.

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

Needs Review: 
Files: *.js; Codeowners: @codeowner3, @codeowner4

Error: Codeowner reviews are needed. Please ask Codeowners to complete their reviews.
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
      - name: Check Reviews
        uses: lmnleaf/codeowner-reviewer-check
        with:
          TOKEN: ${{ secrets.GITHUB_TOKEN }}
          min_reviewers: 3
          include_teams: false
```

Recommendation: Set branch protections/repo rules that require code owner review and run this workflow on `pull_request_review`.
