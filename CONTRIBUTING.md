# Contributing

1. For anything bigger than a small fix, open an issue first.
2. Fork the repository and make your change on a branch. Add a check to `test.mjs` for new behaviour.
3. Run the checks (needs Node.js):

   ```sh
   node plugins/twen/test.mjs
   claude plugin validate .
   ```

4. Open a pull request to `main`. Leave `version` alone.

Mods run on the computer of everyone who installs them, so explain any new network access, program execution or file reads. Contributions are released under the [MIT License](LICENSE).

## Releasing

1. Go to Actions, then Release, then Run workflow, and pick a bump. This opens a pull request that only changes `version`.
2. Merge that pull request. The tag and GitHub Release are then published automatically.

| Bump | Use it for |
| --- | --- |
| `patch` | Fixes |
| `minor` | New moves or options that break nothing |
| `major` | Changes that break existing use, such as removing a move |

Docs and tooling changes need no release. New installs get `main` directly, so keep it working. Keep the Claude Code version in the README the same as the one in `.github/workflows/check.yml`.
