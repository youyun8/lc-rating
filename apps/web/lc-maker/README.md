# LC Maker - Data Processing Tools

This directory contains tools for processing LeetCode data and converting it to Traditional Chinese.

## Files

- `translate_to_traditional.py` - Converts Simplified Chinese to Traditional Chinese in JSON data files
- `requirements.txt` - Python dependencies

## Usage

### Manual Translation

```bash
cd apps/web/lc-maker
pip install -r requirements.txt
python translate_to_traditional.py
```

### Automatic Translation (GitHub Actions)

The translation is automatically run by GitHub Actions workflows:

1. **Problemset Updater** (`.github/workflows/problemset_updater.yml`)
   - Runs every Monday at 04:10 UTC
   - Fetches latest problemset data
   - Automatically translates to Traditional Chinese
   - Commits and pushes changes

2. **Rating Solution Updater** (`.github/workflows/rating_solution_updater.yml`)
   - Runs every Monday at 05:00 UTC
   - Fetches latest solution data
   - Automatically translates to Traditional Chinese
   - Commits and pushes changes

## Translation Details

The script uses OpenCC (Open Chinese Convert) to convert:
- `problems.json` - Problem titles
- `contests.json` - Contest titles
- `solutions.json` - Solution titles
- `tags.json` - Tag names
- `studyplan/*.json` - Study plan content

## Dependencies

- `opencc-python-reimplemented==0.1.7` - Chinese text conversion library
