# LC Maker

This directory contains the Python tooling used by GitHub Actions to keep this
fork's static LeetCode data up to date while translating new upstream content
from Simplified Chinese to Traditional Chinese.

## Scripts

- `sync_upstream.py`
  - Syncs `apps/web/public/problemset/*.json` from
    `huxulm/lc-rating`.
  - Filters contest data down to weekly and biweekly contests.
  - Translates fetched content to Traditional Chinese before writing.
  - Formats written JSON with Prettier when `pnpm`/`npx` is available, matching
    the current checked-in `public/**/*.json` style.
- `merge_upstream_to_local.py`
  - Merges only newly added upstream study-plan problems into the local
    `apps/web/public/studyplan/*.json` files.
  - Leaves existing local summaries untouched.
  - Re-sorts touched sections by `score` in ascending order, with `null`
    scores first.
- `translate_to_traditional.py`
  - Shared translation helpers built on OpenCC.

## Local verification

Install dependencies:

```bash
cd apps/web/lc-maker
python -m pip install -r requirements.txt
```

Dry-run the problemset sync against local files:

```bash
LC_RATING_UPSTREAM_BASE="file:///absolute/path/to/apps/web/public/problemset" \
    python sync_upstream.py --dry-run
```

Skip formatting only when debugging formatter issues:

```bash
python sync_upstream.py --no-format
```

Dry-run the study-plan merge against local files:

```bash
LC_RATING_UPSTREAM_STUDYPLAN_BASE="file:///absolute/path/to/apps/web/public/studyplan" \
    python merge_upstream_to_local.py --dry-run
```

## GitHub Actions

- `.github/workflows/upstream_data_sync.yml`
- `.github/workflows/studyplan_updater.yml`
