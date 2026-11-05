# Contributing

Thanks for helping out. Bug reports, new moves and fixes are all welcome.

## Propose a change

1. For anything bigger than a small fix, open an issue first so we can agree on it.
2. Fork the repository and create a branch.
3. Make your change and run the checks:

   ```sh
   node plugins/twen/test.mjs
   claude plugin validate .
   ```

4. Open a pull request to `main`. Say what changed and how you tested it.

Leave `version` in `plugin.json` alone. The maintainer sets it when releasing.

## What gets reviewed

A mod runs on the computer of everyone who installs it, so each line is read before it is merged.

- Explain any new network access, running of programs or reading of files. Twen uses none of these today.
- Add a check to `test.mjs` for new behaviour.
- Add only your own work, or work whose license allows it.
- By contributing, you agree that your work is released under the [MIT License](LICENSE).

## Releasing (maintainer)

1. Merge the pull requests that belong in the release.
2. Go to Actions, then Release, then Run workflow, and pick the bump.

The workflow runs the checks, updates `version`, creates the `twen-vX.Y.Z` tag and publishes the GitHub Release.

| Bump | Use it for | Example |
| --- | --- | --- |
| `patch` | Fixes that add nothing new | A wrong frame, a failing command |
| `minor` | New features that break nothing | A new move or a new option |
| `major` | Changes that break existing use | Removing or renaming a move or command |

Keep the tested Claude Code version in the README the same as the one pinned in `.github/workflows/check.yml`. It is only a tested version, not a minimum.

Changes that only touch docs or the repository's own tooling need no release. People who install Twen get `main`, so keep it working at all times.
