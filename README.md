# TorBox Direct

A Stremio and Nuvio stream addon that lists **TorBox-cached** releases for whatever movie or episode you open. It talks to TorBox directly: no Torrentio, Comet, MediaFusion or AIOStreams instance sits in the middle. Results are rendered with the AIOStreams formatter, so cards look like an AIOStreams setup (4K · DV · IMAX, sizes, release groups).

```text
catalog ID (tt… / tmdb:…)
  → ID-to-hash lookup (Zilean/DMM release index, plus your own TorBox library)
  → one batched TorBox cache check
  → the exact cached video file (right episode inside season packs)
  → filter, rank and format
  → stream cards

play
  → fresh TorBox cache check
  → existing library item, or add with add_only_if_cached (never starts an uncached download)
  → TorBox CDN
```

Only cached releases are listed, including ones that are not in your library yet. The ID-to-hash lookup is the search stage performed by addons such as Comet; TorBox's cache API then returns the actual cached filenames for those hashes. This addon implements that stage itself and does not call Torrentio, Comet, Nyaa or AnimeTosho. It does depend on the public Zilean/DMM release index for titles not already indexed locally. It does not claim to search TorBox's complete cache by title or IMDb ID.

MAL, Kitsu, AniList and AniDB IDs are converted to IMDb/season/episode using a bundled metadata crosswalk from [Fribb/anime-lists](https://github.com/Fribb/anime-lists). They then use the same search route as other titles. No separate anime torrent scraper is used. Ambiguous mappings fail instead of guessing an episode. Refresh the factual ID crosswalk with `node scripts/refresh-anime-ids.mjs`.

## Use it

1. Open the configure page of an instance, for example `https://nuvio-torbox-direct.vercel.app/configure`.
2. Paste your own TorBox API key (and, optionally, a TMDB key if your catalogs use `tmdb:` IDs).
3. Copy the private manifest URL into Nuvio or Stremio. The same URL works on TV, tablet and desktop.

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

- Coverage depends on the public release index plus your library. The documented TorBox Voyager search hostname did not resolve during verification. The main cache API takes torrent hashes, not media IDs. See [request trace](docs/request-trace.md).
- Supports IMDb (`tt…`), TMDB with an optional TMDB key, and unambiguously mapped MAL/Kitsu/AniList/AniDB IDs. Coverage for anime depends on the same general release index and the available season/episode mappings.
- The hosted adapter supports the profile's basic resolution, quality, visual-tag, language and keyword filters/sorting and uses the original AIOStreams formatter. Advanced SEL, SeaDex and bitrate ranking are not implemented.
- Hosted warm caches are instance-local and can reset on a cold start; a fast warm request is not a guarantee of cold-request latency.
- Response lists are capped at 60 streams.

## License

AGPL-3.0-only (see `LICENSE`). A running instance serves its exact source at `/source.zip`.

Includes the formatter from [AIOStreams](https://github.com/Viren070/AIOStreams) v2.37.0 by Viren070 (AGPL-3.0), in `vendor/` with its license. Release metadata comes from [Zilean](https://github.com/iPromKnight/zilean); catalog metadata from Cinemeta. Not affiliated with TorBox.
