# AIOStreams components

`aiostreams-formatter.mjs` and `aiostreams-parser.mjs` derive from [Viren070/AIOStreams v2.37.0](https://github.com/Viren070/AIOStreams/tree/v2.37.0), copyright Viren070 and contributors, AGPL-3.0-only. The license is included as `AIOSTREAMS-LICENSE`. Corresponding source is in `aiostreams-source/` and the runtime adapters are in `scripts/vendor-entry/`.

The parser/sorter bundle is reproducible with `npm run build:parser`. Its build script removes the sorter's redundant `async` modifier, after checking that its implementation contains no `await`. The pure title-normalization helpers were extracted from the upstream parser utilities. A minimal logging barrel supplies no-op logging; upstream database types are erased during compilation. The application's language-confidence adjustment lives in `src/format.mjs`, outside the upstream parser.

The runtime title parser is `@viren070/parse-torrent-title`, as in AIOStreams. All build inputs needed for the included bundles are available in the repository and deployed `/source.zip`.
