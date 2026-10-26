# TorBox Direct

A Stremio and Nuvio stream addon that lists **TorBox-cached** releases for whatever movie or episode you open. It talks to TorBox directly: no Torrentio, Comet, MediaFusion or AIOStreams instance sits in the middle. Results are rendered with the AIOStreams formatter, so cards look like an AIOStreams setup (4K · DV · IMAX, sizes, release groups).

```text
catalog ID (tt… / tmdb:…)
  → public release index (Zilean/DMM hashes, plus your own TorBox library)
  → one batched TorBox cache check
  → the exact cached video file (right episode inside season packs)
  → filter, rank and format
  → stream cards

play
  → fresh TorBox cache check
  → existing library item, or add with add_only_if_cached (never starts an uncached download)
  → TorBox CDN
```

Only cached releases are listed, including ones that are not in your library yet.

## Use it

1. Open the configure page of an instance, for example `https://nuvio-torbox-direct.vercel.app/configure`.
2. Paste your own TorBox API key (and, optionally, a TMDB key if your catalogs use `tmdb:` IDs).
3. Copy the private manifest URL into Nuvio or Stremio. The same URL works on TV, tablet and desktop.

## Privacy and security model

- The configure page starts blank. The server has no default account and stores no user keys.
- Your key is checked once against TorBox, then sealed with AES-256-GCM into your install URL (`/v1.<token>/manifest.json`). The server holds only the encryption secret (`TORBOX_DIRECT_SECRET`) and decrypts your token in memory while answering your own requests.
- Keys, install tokens and playback links are never logged.
- Each install link gets its own TorBox client, response cache and library index, so one account's library never appears in another account's results.
- Playback links are HMAC-signed per install link, expire after 24 hours, and only work under the install link that produced them.
- **Treat your install URL like a password.** Anyone holding it can use the addon through your TorBox account, the same as with any addon whose URL carries your debrid key. To revoke all your links, regenerate your TorBox API key.

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

- Coverage depends on the public release index plus your library. TorBox no longer offers a global search API (`search-api.torbox.app` was retired), so no addon can enumerate everything TorBox has cached.
- Movie and series requests need IMDb (`tt…`) or, with a TMDB key, `tmdb:` IDs. Other ID schemes (Kitsu, MAL) return no streams.
- Response lists are capped at 60 streams.

## License

AGPL-3.0-only (see `LICENSE`). A running instance serves its exact source at `/source.zip`.

Includes the formatter from [AIOStreams](https://github.com/Viren070/AIOStreams) v2.37.0 by Viren070 (AGPL-3.0), in `vendor/` with its license. Release metadata comes from [Zilean](https://github.com/iPromKnight/zilean); catalog metadata from Cinemeta. Not affiliated with TorBox.
