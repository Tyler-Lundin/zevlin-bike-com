# Branch Protection Requirements

Apply these to `development`:

- Require pull request before merge
- Require at least 1 code owner review
- Require status checks: `CI / verify` and `Security / sast-and-secrets`
- Restrict force pushes and deletions

Apply these to `production`:

- Require pull request before merge
- Require at least 1 code owner review
- Require status checks: `CI / verify` and `Security / sast-and-secrets`
- Require branch to be up to date before merge
- Require linear history
- Restrict force pushes and deletions

Promotion rule:

- Only merge `development` into `production` for release promotion
