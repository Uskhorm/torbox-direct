# TorBox Direct

[![Checks](https://github.com/Uskhorm/torbox-direct/actions/workflows/ci.yml/badge.svg)](https://github.com/Uskhorm/torbox-direct/actions/workflows/ci.yml)

[Configure the addon](https://nuvio-torbox-direct.vercel.app/configure) · [GitHub](https://github.com/Uskhorm/torbox-direct) · [Contribute](CONTRIBUTING.md)

A Stremio and Nuvio stream addon that lists **TorBox-cached** releases for whatever movie or episode you open. It talks to TorBox directly: no Torrentio, Comet, MediaFusion or AIOStreams instance sits in the middle. Results are rendered with the AIOStreams formatter, so cards look like an AIOStreams setup (4K · DV · IMAX, sizes, release groups).

```text
catalog ID (tt… / tmdb:…)
  → ID-to-hash lookup (Zilean/DMM, Knaben, raw Torz metadata, your own TorBox files)
  → batched TorBox cache checks (short-lived per-account memoization)
  → the exact cached video file (right episode inside season packs)
  → filter, rank and format
  → stream cards

play
  → fresh TorBox cache check
  → existing library item, or add with add_only_if_cached (never starts an uncached download)
  → TorBox CDN
```

Only cached releases are listed, including ones that are not in your library yet. The ID-to-hash lookup is the search stage performed by addons such as Comet; TorBox's cache API then returns the actual cached filenames for those hashes. This addon implements that stage itself. Discovery combines Zilean/DMM, Knaben's raw hash database, the public Torz Torznab metadata index, and individual files in the user's own TorBox collections. It never calls the Torrentio, Comet, Nyaa or AnimeTosho websites/addons. The Torz endpoint supplies only public hash metadata; its Stremio addon, debrid/store API and playback resolver are not used, and it never receives a TorBox key. It does not claim to search TorBox's complete cache by title or IMDb ID.

MAL, Kitsu, AniList and AniDB IDs are converted to IMDb/season/episode using a bundled metadata crosswalk from [Fribb/anime-lists](https://github.com/Fribb/anime-lists) and the [Kitsu addon metadata mappings](https://github.com/TheBeastLT/stremio-kitsu-anime). They then use the same search route as other titles. Anime episodes with bare numbers are matched using the canonical episode mapping rather than a largest-file fallback. Ambiguous mappings fail instead of guessing. Refresh the factual ID crosswalk with `node scripts/refresh-anime-ids.mjs`.

## Use it

1. Open the configure page of an instance, for example `https://nuvio-torbox-direct.vercel.app/configure`.
2. Paste your own TorBox API key. A TMDB key is optional: the addon also maps TMDB IDs through cached metadata and Wikidata.
3. Copy the private manifest URL into Nuvio or Stremio. The same URL works on TV, tablet and desktop.

Version 0.4 searches both IMDb-tagged and title-only metadata even when ID search already has results. It fetches complete Torznab ID results, checks candidates beyond the former 2,500-hash cutoff, and returns all matching distinct files rather than the first 60. AIOStreams' native parser and sorter drive the quality fields and ordering, with an additional language-label check to avoid mistaking title words or release-group names for audio languages. The existing card formatter is preserved.

Repeated and next-episode searches reuse bounded account caches and in-flight hash checks. An indexed anime crosswalk avoids scanning the entire mapping on every request. These changes preserve fresh playback availability checks. See [verification and performance](docs/verification.md) for measured results and remaining coverage gaps.

## Privacy and security model

- The configure page starts blank. The server has no default account and stores no user keys.
- Your key is checked once against TorBox, then sealed with AES-256-GCM into your install URL (`/v1.<token>/manifest.json`). The server holds only the encryption secret (`TORBOX_DIRECT_SECRET`) and decrypts your token in memory while answering your own requests.
- The addon never logs keys, install tokens or playback links.
- Each TorBox account gets its own TorBox client, response cache and library index, so one account's library never appears in another account's results.
- Playback links are HMAC-signed per account, expire after 24 hours, and never work under another account's install link.
- **Treat your install URL like your TorBox API key.** TorBox's download links contain the account's API key (`token=`), so anyone holding your install URL, or a play link from it, can play through your account and read the key from the playback redirect. This is the same exposure as Torrentio/Comet/AIOStreams URLs. To revoke all your links, regenerate your TorBox API key.
- You trust the instance operator. The server never stores keys, but it decrypts install tokens to serve requests, and platform request logs (e.g. Vercel) record request paths, which contain the encrypted token. Self-host if that matters to you.
- Static publishing is limited to the `public/` directory; source and credential files are excluded. Link generation is rate limited per IP and account caches are isolated. `HEAD` probes on play links never change the account or request a download link.

## Self-hosting

Requires Node 24+.

```bash
npm install
npm test
# 32 random bytes, base64url; keep it stable or existing install links stop working
export TORBOX_DIRECT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
npm start            # http://localhost:7000/configure
```

### Vercel

```bash
vercel env add TORBOX_DIRECT_SECRET production   # paste the secret
git commit ...                                   # /source.zip is built from HEAD
npm run prepare:hosted                           # builds deployment/source.zip (AGPL source offer)
vercel deploy --prod
```

`vercel.json` routes every path to `api/addon.mjs`. Optionally set `PUBLIC_BASE_URL` to pin the domain used in generated links.

### Preferences

`deployment/preferences.json` is the default filtering, sorting and formatter profile applied to every install link. To use your own AIOStreams profile, export your AIOStreams config and run:

```bash
npm run import:preferences -- path/to/aiostreams-config-export.json
```

Only preference keys are copied; credentials and service settings are ignored.

## Limits

- Coverage depends on the available metadata indexes and your library. The documented TorBox Voyager search hostname did not resolve during verification. The main cache API takes torrent hashes, not media IDs. See [request trace](docs/request-trace.md).
- Supports IMDb (`tt…`), TMDB via cached/Wikidata mappings or an optional TMDB key, and unambiguously mapped MAL/Kitsu/AniList/AniDB IDs. Coverage can still differ from other addons and is not guaranteed for every release.
- The hosted adapter uses AIOStreams' file parser, sorter and formatter with basic resolution, quality, visual-tag, language and keyword filtering. Full SEL, synchronized regex lists, SeaDex and bitrate enrichment are not implemented.
- Hosted warm caches are instance-local and can reset on a cold start; a fast warm request is not a guarantee of cold-request latency.
- Metadata services may impose their own result limits. The addon does not impose a fixed hash-candidate or stream-result cap. A finite reference comparison cannot establish complete-catalog parity.

## License

AGPL-3.0-only (see `LICENSE`). A running instance serves its exact source at `/source.zip`.

Includes the parser, sorter and formatter from [AIOStreams](https://github.com/Viren070/AIOStreams) v2.37.0 by Viren070 (AGPL-3.0), in `vendor/` with [attribution and build instructions](vendor/NOTICE.md). Release metadata comes from Zilean/DMM, Knaben and the public Torz metadata index; catalog metadata from Cinemeta, with optional TMDB enrichment. Not affiliated with TorBox.
