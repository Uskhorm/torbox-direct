# Contributing

TorBox Direct is public at https://github.com/Uskhorm/torbox-direct. Issues and pull requests are welcome.

Use Node 24 or newer. Run `npm ci`, `npm test` and `npm run bench` before opening a pull request. The tests use fixtures and need no TorBox account. To modify the vendored parser/sorter, edit the included TypeScript and run `npm run build:parser`; commit the resulting bundle with the source. Keep the AIOStreams license and attribution.

When reporting a missing release, include the catalog ID, movie or episode, expected filename and **individual video size**. A season-pack total is not the episode size. Public infohashes are useful; include one only when the torrent is public. Never post API keys, private manifest URLs, signed playback links, account inventories or complete config exports.

The discovery APIs return public hash metadata; only TorBox checks cache availability and resolves playback. Runtime dependencies on Torrentio, Comet or AIOStreams are outside this design. Keep each account's library, TorBox responses and playback links isolated. Searching, refreshing, `HEAD` and tests must not add account items. Playback must recheck availability and use `add_only_if_cached=true`.

For an optional live reference comparison, create an **ignored private JSON file** with `aiostreamsConfig` pointing to your local config export and `fallbackManifest` containing your private reference manifest. Run:

```text
node scripts/compare-reference.mjs --runtime path/to/runtime.private.json --output data/comparison.json
```

This fetches stream lists and checks hashes; it never follows playback URLs. The output contains filenames, sizes, public hashes and aggregate metrics, with no keys or URLs. Review and redact it before sharing: filenames can still reveal viewing interests. Live checks are supplementary; never give credentials to CI or attach private files to an issue. Expand the cases to reproduce the affected catalog IDs.

Coverage claims must identify the sample and distinguish an absent hash, an excluded language/quality, a wrong movie/episode, and a pack-size label. Passing a small comparison suite cannot establish complete-catalog coverage. Performance changes must preserve results and fresh playback checks. Label simulated benchmarks separately from live timings.

Contributions use AGPL-3.0-only. Deployment is maintained separately from pull-request checks; contributors' code never runs with deployment credentials in CI.
