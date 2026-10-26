# Changelog

## 0.4.0

- Search title-only metadata alongside IMDb associations, including resolution queries and optional translated titles.
- Remove fixed candidate/result caps and fetch complete Torznab ID results, including full-show packs.
- Normalize punctuation, ampersands and `and` consistently, retain verified ID matches, and correct language inference from title/group text.
- Use AIOStreams' native file parser and sorter while preserving the card formatter.
- Add bounded availability and parser caches, coalesce overlapping requests, share public discovery work, and index anime ID lookup. Playback continues to require a fresh cache check.
- Add a read-only reference comparison tool, deterministic performance benchmark, regression tests, contribution instructions and GitHub Actions checks.
- Document measured improvements and remaining independent-index gaps without claiming complete-catalog parity.
