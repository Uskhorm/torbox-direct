# Metadata ID to cached TorBox file

Verified 2026-10-26 against upstream source, TorBox documentation and live requests.

1. Nuvio calls `/<private-config>/stream/movie/tt3315342.json`, or a series ID with season and episode.
2. The addon resolves that ID to release records containing a title, size and 40-character torrent infohash. A hash identifies the exact torrent and its file tree. Different encodes of the same film normally have different hashes.
3. The addon submits those hashes to `POST https://api.torbox.app/v1/api/torrents/checkcached?format=object&list_files=true` with JSON `{ "hashes": ["..."] }` and the user's Bearer API key.
4. TorBox returns cached torrents and their file lists. These filenames can differ from the release-index label because they are the actual files inside the exact torrent identified by the submitted hash. Unrequested hashes are discarded by this addon.
5. The addon selects the exact episode, parses the actual filename, applies the preference profile and renders cards with the original AIOStreams formatter.
6. On GET playback, the addon rechecks cache availability, reuses the existing account item or adds only with `add_only_if_cached=true`, then requests the selected file's CDN link. Merely searching or probing with HEAD never adds a torrent.

The implementation of step 2 is `src/seed.mjs` plus the SQLite ID-to-hash table in `src/index.mjs`. The public Zilean/DMM database supplies candidate hashes for an uncached lookup; subsequent searches reuse the index. TorBox credentials never go to that metadata source. MAL/Kitsu/AniList/AniDB conversion is metadata mapping only, before the same pipeline.

Sources inspected:

- [Comet stream handler](https://github.com/g0ldyy/comet/blob/main/comet/api/endpoints/stream.py): the media ID enters Comet's torrent discovery pipeline before debrid availability is resolved.
- [Comet's TorBox search source](https://github.com/g0ldyy/comet/blob/main/comet/scrapers/torbox.py): its optional TorBox discovery source requests `https://search-api.torbox.app/torrents/imdb:<id>` and extracts each returned `hash`. That hostname had no DNS address in the current live check.
- [AIOStreams TorBox Search preset](https://github.com/Viren070/AIOStreams/blob/main/packages/core/src/presets/torboxSearch.ts): explicitly marks that search backend as shut down.
- [TorBox Main API](https://api-docs.torbox.app/): the current batch cache check accepts torrent hashes and can return cached file lists; it is separate from the old media-ID search API.
- [Torrentio maintainer](https://github.com/TheBeastLT/torrentio-scraper/issues/431): Torrentio's internal scraping/database implementation is not publicly available. No claim is made that this addon clones its private database or has inspected its server internals.

The middle search stage has been replaced with an independent ID-to-hash resolver. The current implementation is direct TorBox cache checking and playback, not a TorBox-only global media search. Removing every release index would leave only the user's own known library hashes and could not preserve global cached-release discovery with the presently reachable API.
