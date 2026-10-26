# Version 0.4 verification

Verified on 2026-10-26. Unit/integration tests use fixtures; live comparisons use a private reference account and never follow reference playback URLs. Neither searching nor comparison adds TorBox items.

## Coverage repairs

The reproduced gaps had several causes: fixed Torznab paging, a 2,500-candidate cutoff, a 60-result cutoff, `&` versus `and` title matching, omitted title-only search when ID search already looked populated, complete packs missing episode mappings, and language labels inferred from a title or non-Latin release group. All are addressed in this release.

Live checks independently confirmed these actual cached video files in the new engine:

| Catalog | Recovered file |
| --- | --- |
| Deadpool & Wolverine, `tt6263850` | DreamHD UHD DV remux, 61,535,649,093 bytes |
| Deadpool & Wolverine, `tt6263850` | UHD BDRemux HDR/DV, 60,287,415,334 bytes |
| Shang-Chi, `tt9376612` | DVSUX 2160p DV IMAX, 27,016,298,862 bytes |

The reference comparison also covers Spider-Man: No Way Home, Logan, Dark S1E2, Game of Thrones S1E1, Inferno Cop E1 and Great Pretender E1. It compares freshly confirmed hashes and actual selected video files. It separates unresolved reference hashes and incorrect file/size labels. For example, an AIO Shang-Chi result pointed to a 43.61 GB Spider-Man file inside a collection; the resolver correctly selects the 21.50 GB Shang-Chi video in that pack. A season-pack total is likewise not the episode size.

**Full reference parity has not been achieved.** The eight-case comparison still finds hashes missing from the independent metadata indexes, plus releases excluded by the configured language rules. In the initial comparison Deadpool covered 15 of 19 independently matched reference files; after the fixes it covered 18 of 19. Shang-Chi improved from 14/19 to 18/19; Dark from 12/19 to 16/19. These are a small, time-sensitive sample, not catalogue-wide percentages or guarantees. The remaining cases and diagnostic output are intentionally not bundled with account-derived inventory.

## Performance

Run `npm run bench` for a deterministic benchmark without credentials. With 3,000 candidate hashes, 80 cached two-episode packs and 15 ms simulated upstream latency, one local run measured:

| Request | Time | TorBox calls | Results |
| --- | ---: | ---: | ---: |
| Cold search | 208.58 ms | 2 | 80 |
| Next episode | 37.82 ms | 0 | 80 |
| Repeat | 0.04 ms | 0 | 80 |

These are simulated timings, not hosted latency claims. Live full-coverage cold searches in the development comparison ranged approximately 0.4–3.1 seconds for the eight cases, with a slower 6.7-second Game of Thrones run before candidate season filtering. Network and cache state vary. Broader discovery can make a cold request slower than an incomplete search. Repeat requests use the response cache; adjacent episodes can reuse the same short-lived hash availability data.

The benchmark fails if results disappear or the next episode/repeat performs another TorBox cache request. Tests additionally check overlapping hash requests, expiration of negative entries, fresh playback checks despite warm positive entries, account isolation, regenerated install-link rebasing, a best candidate after position 2,500, and more than 60 matching distinct files.

Public hashes and public release metadata can be shared between accounts. TorBox responses, own-library inventories and playback URLs remain in bounded per-account memory. Positive availability lasts 45 seconds, negatives 8 seconds, successful response lists 45 seconds and empty response lists 5 seconds. Playback always bypasses search availability caches.
