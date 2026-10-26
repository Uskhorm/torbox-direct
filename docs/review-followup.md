# Follow-up to the saved Opus review

Checked against the current implementation on 2026-10-26. The live T3 thread tools required authentication, so the saved local Claude subagent transcripts and their completed StructuredOutput results were inspected directly. No replacement review was started.

Addressed in the deployed implementation or this release:

- Restrict static publishing to `public/`; private account data and arbitrary project files are inaccessible.
- Bound configuration attempts, request bodies, engine count and response caches; isolate account libraries.
- HEAD playback probes validate the signed token and return without upstream requests or account changes.
- Disclose that a private install link grants account access and TorBox CDN redirects can expose the account API key. The addon cannot promise key secrecy from someone who holds that link.
- Retain existing index/library results when release discovery temporarily fails.
- Keep generated playback URLs tied to the current install URL when an account has multiple configuration links.
- Convert supported anime catalog IDs to the same IMDb cache-check route, with mapped season/episode offsets.
- Restrict shared-index searches to exact media-ID mappings; strictly match titles for library title fallbacks. This prevents similarly named films or different versions of a series from entering results.
- Trust an authoritative IMDb-to-hash mapping when release-year labels differ from catalog metadata. Unmapped library matches still apply the configured movie-year check.
- Recognize 3D, upscaled and AI-upscaled labels so their exclusions work.
- Retry empty release-index results after one minute instead of caching an empty result for a full day.
- Add Stremio web compatibility hints for MKV, HEVC, AV1 and HDR/DV streams.
- Add the website favicon, PNG fallback and Apple touch icon using the addon logo.
- Expand discovery beyond Zilean/DMM using independent raw Knaben/Torz hash metadata; keep TorBox credentials and cache/playback calls on TorBox only.
- Merge the Kitsu metadata crosswalk to fill missing anime IMDb mappings and select bare-numbered anime episodes using canonical episode mappings.
- Discover individual films inside account collection packs, with strict selected-file title matching. Distinguish IMAX Enhanced from actual AI/upscale labels.
- Resolve TMDB catalog IDs without a second key through cached metadata/Wikidata mappings.

Remaining limitations from the review:

- The later full AIOStreams pipeline task was interrupted during investigation. It did not produce a completed implementation. The original formatter and basic filtering/sorting are present, but full SEL, synchronized regex lists, SeaDex and bitrate-ranking parity remain unfinished.
- Cinemeta often omits original-language metadata. Language-based filtering of an owned multilingual release can still exclude it when its filename does not identify an allowed language.
- Ambiguous or incomplete anime season/cour mappings still need more mapping data; the selector rejects ambiguous episodes.
- Candidate coverage depends on the available independent hash indexes and known account files. It cannot enumerate TorBox's complete global cache or guarantee every release.
- Playback links expire after 24 hours; Nuvio configurations that reuse links longer need to refresh the stream list.
- Upstream calls have individual timeouts rather than one search deadline. Discovery and cache checks now use bounded concurrency and shorter timeouts, but extreme simultaneous failures can still cause slow requests.

The favicon update and the targeted matching/exclusion repairs do not complete the unfinished full-pipeline task.
